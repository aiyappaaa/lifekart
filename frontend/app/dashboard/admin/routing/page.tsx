'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { TrendingUp, Plus, Trash2 } from 'lucide-react'

export default function RoutingRulesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  
  // Progression Rules State
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [progressionRules, setProgressionRules] = useState<any[]>([])
  const [newProgRule, setNewProgRule] = useState({ specific_product_id: '', start_age_months: 0, end_age_months: 12 })
  const [loadingRules, setLoadingRules] = useState(false)

  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [substitutes, setSubstitutes] = useState<any[]>([])
  const [newSub, setNewSub] = useState({ substitute_product_id: '' })
  const [loadingSubs, setLoadingSubs] = useState(false)

  // Confirmation Modal State
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'progression' | 'substitute', id: string } | null>(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [catsData, prodsData] = await Promise.all([
        apiClient('/catalog/categories'),
        apiClient('/catalog/products?limit=100')
      ])
      setCategories(Array.isArray(catsData) ? catsData : [])
      setProducts(Array.isArray(prodsData) ? prodsData : [])
    } catch (err) {
      toast.error('Failed to load catalog data.')
    }
  }

  // ── PROGRESSION RULES ──

  useEffect(() => {
    if (selectedCategory) fetchProgressionRules(selectedCategory)
    else setProgressionRules([])
  }, [selectedCategory])

  const fetchProgressionRules = async (categoryId: string) => {
    setLoadingRules(true)
    try {
      const data = await apiClient(`/catalog/categories/${categoryId}/progression-rules`)
      setProgressionRules(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Failed to load progression rules.')
    } finally {
      setLoadingRules(false)
    }
  }

  const handleAddProgressionRule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory || !newProgRule.specific_product_id) return toast.error('Select a product')
    
    try {
      await apiClient('/catalog/progression-rules', {
        method: 'POST',
        body: JSON.stringify({
          category_id: selectedCategory,
          ...newProgRule
        })
      })
      toast.success('Progression rule added')
      setNewProgRule({ specific_product_id: '', start_age_months: 0, end_age_months: 12 })
      fetchProgressionRules(selectedCategory)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add rule')
    }
  }

  const initiateDeleteProgressionRule = (id: string) => {
    setConfirmDelete({ type: 'progression', id })
  }

  // ── SUBSTITUTES ──

  useEffect(() => {
    if (selectedProduct) fetchSubstitutes(selectedProduct)
    else setSubstitutes([])
  }, [selectedProduct])

  const fetchSubstitutes = async (productId: string) => {
    setLoadingSubs(true)
    try {
      const data = await apiClient(`/catalog/products/${productId}/substitutes`)
      setSubstitutes(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Failed to load substitutes.')
    } finally {
      setLoadingSubs(false)
    }
  }

  const handleAddSubstitute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || !newSub.substitute_product_id) return toast.error('Select a substitute')
    if (selectedProduct === newSub.substitute_product_id) return toast.error('Product cannot be its own substitute')
    
    const nextRank = substitutes.length > 0 ? Math.max(...substitutes.map(s => s.priority_rank)) + 1 : 1

    try {
      await apiClient('/catalog/product-substitutes', {
        method: 'POST',
        body: JSON.stringify({
          product_id: selectedProduct,
          priority_rank: nextRank,
          ...newSub
        })
      })
      toast.success('Substitute mapped')
      setNewSub({ substitute_product_id: '' })
      fetchSubstitutes(selectedProduct)
    } catch (err: any) {
      toast.error(err.message || 'Failed to map substitute')
    }
  }

  const initiateDeleteSubstitute = (id: string) => {
    setConfirmDelete({ type: 'substitute', id })
  }

  const executeDelete = async () => {
    if (!confirmDelete) return

    try {
      if (confirmDelete.type === 'progression') {
        await apiClient(`/catalog/progression-rules/${confirmDelete.id}`, { method: 'DELETE' })
        toast.success('Rule deleted')
        fetchProgressionRules(selectedCategory)
      } else {
        await apiClient(`/catalog/product-substitutes/${confirmDelete.id}`, { method: 'DELETE' })
        toast.success('Substitute deleted')
        fetchSubstitutes(selectedProduct)
      }
    } catch (err) {
      toast.error(`Failed to delete ${confirmDelete.type === 'progression' ? 'rule' : 'substitute'}`)
    } finally {
      setConfirmDelete(null)
    }
  }

  // Helper to get product name
  const getProductName = (id: string) => {
    const p = products.find(prod => prod.id === id)
    return p ? p.name : 'Unknown Product'
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">Routing Rules</h1>
        <p className="text-gray-500 mt-1">Configure automated progression transitions and inventory substitutes.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* PROGRESSION RULES PANEL */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 flex flex-col h-[600px]">
          <div className="mb-6">
            <h2 className="text-xl font-bold font-display uppercase tracking-tight mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Age Progression Map
            </h2>
            <p className="text-sm text-gray-500 mb-4">Map how subscriptions evolve over time within a category (e.g. Diaper sizes).</p>
            
            <select 
              value={selectedCategory} 
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none"
            >
              <option value="">-- Select a Category --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto mb-6 pr-2">
            {!selectedCategory ? (
              <div className="text-center text-gray-400 py-12 text-sm">Select a category to view its progression rules.</div>
            ) : loadingRules ? (
              <div className="text-center text-gray-400 py-12 text-sm animate-pulse">Loading rules...</div>
            ) : progressionRules.length === 0 ? (
              <div className="text-center text-gray-400 py-12 text-sm">No progression rules mapped for this category.</div>
            ) : (
              <div className="space-y-3">
                {progressionRules.map((rule) => (
                  <div key={rule.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <div className="font-bold text-sm text-gray-900">{getProductName(rule.specific_product_id)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Months: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">{rule.start_age_months}</span> to <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">{rule.end_age_months}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => initiateDeleteProgressionRule(rule.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedCategory && (
            <form onSubmit={handleAddProgressionRule} className="mt-auto bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="font-bold text-xs uppercase text-gray-500 mb-3 tracking-wider">Add New Rule</div>
              <div className="grid grid-cols-1 gap-3 mb-3">
                <select 
                  required
                  value={newProgRule.specific_product_id}
                  onChange={e => setNewProgRule({...newProgRule, specific_product_id: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="">-- Target Product --</option>
                  {products.filter(p => p.category_id === selectedCategory).map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku}) — {p.manufacturer_company}</option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Start (Months)</label>
                    <input 
                      type="number" min="0" required
                      value={newProgRule.start_age_months}
                      onChange={e => setNewProgRule({...newProgRule, start_age_months: parseInt(e.target.value)})}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">End (Months)</label>
                    <input 
                      type="number" min="0" required
                      value={newProgRule.end_age_months}
                      onChange={e => setNewProgRule({...newProgRule, end_age_months: parseInt(e.target.value)})}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-black text-white rounded-lg py-2 text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                <Plus className="w-4 h-4" /> Map Progression
              </button>
            </form>
          )}
        </div>

        {/* SUBSTITUTES PANEL */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 flex flex-col h-[600px]">
          <div className="mb-6">
            <h2 className="text-xl font-bold font-display uppercase tracking-tight mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Substitute Logic
            </h2>
            <p className="text-sm text-gray-500 mb-4">Map fallback products to fulfill subscriptions when an item goes out of stock.</p>
            
            <select 
              value={selectedProduct} 
              onChange={e => setSelectedProduct(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none"
            >
              <option value="">-- Select a Target Product --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku}) — {p.manufacturer_company}</option>)}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto mb-6 pr-2">
            {!selectedProduct ? (
              <div className="text-center text-gray-400 py-12 text-sm">Select a product to view its substitutes.</div>
            ) : loadingSubs ? (
              <div className="text-center text-gray-400 py-12 text-sm animate-pulse">Loading substitutes...</div>
            ) : substitutes.length === 0 ? (
              <div className="text-center text-gray-400 py-12 text-sm">No substitutes mapped for this product.</div>
            ) : (
              <div className="space-y-3">
                {substitutes.sort((a,b) => a.priority_rank - b.priority_rank).map((sub) => (
                  <div key={sub.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                        #{sub.priority_rank}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-900">{getProductName(sub.substitute_product_id)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Backup Supply Chain</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => initiateDeleteSubstitute(sub.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedProduct && (
            <form onSubmit={handleAddSubstitute} className="mt-auto bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="font-bold text-xs uppercase text-gray-500 mb-3 tracking-wider">Add Backup Product</div>
              <div className="flex gap-3 mb-3 items-end">
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Select Backup</label>
                  <select 
                    required
                    value={newSub.substitute_product_id}
                    onChange={e => setNewSub({...newSub, substitute_product_id: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                  >
                    <option value="">-- Fallback Product --</option>
                    {products.filter(p => p.id !== selectedProduct).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku}) — {p.manufacturer_company}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-black text-white rounded-lg py-2 text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                <Plus className="w-4 h-4" /> Map Substitute
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-8 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-display font-extrabold mb-2">
              Delete {confirmDelete.type === 'progression' ? 'Progression Rule' : 'Substitute'}?
            </h2>
            <p className="text-gray-500 mb-8">
              {confirmDelete.type === 'progression' 
                ? 'This will remove the automated age progression map for this product. Subscriptions will no longer auto-transition based on this rule.'
                : 'This will remove the fallback mapping. If the primary product goes out of stock, the system will not fall back to this substitute.'}
            </p>

            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setConfirmDelete(null)}
                className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors w-full"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="px-6 py-3 rounded-xl font-bold text-white transition-colors shadow-sm w-full bg-red-600 hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
