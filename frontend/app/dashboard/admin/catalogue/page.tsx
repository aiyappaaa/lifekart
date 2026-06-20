'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { Package, Tags, Box, Plus, Settings2, BarChart2 } from 'lucide-react'

export default function CataloguePage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')
  
  // Data
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Category Form
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', description: '', unit_type: 'kg', avg_yearly_consumption: 50 })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodData, catData] = await Promise.all([
        apiClient('/catalog/products?limit=100'),
        apiClient('/catalog/categories?limit=100')
      ])
      setProducts(Array.isArray(prodData) ? prodData : [])
      setCategories(Array.isArray(catData) ? catData : [])
    } catch (err) {
      toast.error('Failed to load catalogue data.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...newCat,
        slug: newCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }

      await apiClient('/catalog/categories', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      toast.success('Category created successfully')
      setShowAddCategory(false)
      setNewCat({ name: '', description: '', unit_type: 'kg', avg_yearly_consumption: 50 })
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create category')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">Global Catalogue</h1>
          <p className="text-gray-500 mt-1">Oversight of all products and core category configurations.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'products' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="w-4 h-4" /> Products
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'categories' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Tags className="w-4 h-4" /> Categories
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 min-h-[500px]">
        {loading ? (
          <div className="text-center text-gray-400 py-20 animate-pulse">Loading catalogue...</div>
        ) : activeTab === 'products' ? (
          /* Products Tab (Read Only) */
          products.length === 0 ? (
            <div className="text-center py-20">
              <Box className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Products Found</h3>
              <p className="text-gray-500">Manufacturers have not uploaded any products yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 mb-6 text-sm flex items-start gap-2">
                <Settings2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Global Product Oversight</p>
                  <p className="opacity-80">This is a read-only view. Verified Manufacturers create and manage their own product inventories securely via the Manufacturer Portal.</p>
                </div>
              </div>
              
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-bold pl-2">Item</th>
                    <th className="pb-3 font-bold">Category</th>
                    <th className="pb-3 font-bold">Manufacturer</th>
                    <th className="pb-3 font-bold text-right pr-2">Wholesale Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="font-bold text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 font-mono">SKU: {product.sku}</div>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                          {categories.find(c => c.id === product.category_id)?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="text-sm font-bold">{product.manufacturer_company || 'Legacy Supplier'}</div>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <div className="font-bold text-gray-900 font-mono">₹{Number(product.unit_price_wholesale || 0).toFixed(2)}</div>
                        <div className="text-xs text-gray-500">per unit</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Categories Tab */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold font-display uppercase">Taxonomy Core</h2>
              <button 
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> New Category
              </button>
            </div>

            {showAddCategory && (
              <form onSubmit={handleAddCategory} className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8 animate-in slide-in-from-top-4 duration-300">
                <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-gray-500">Create Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Name</label>
                    <input required value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="e.g. Premium Rice" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Unit Type</label>
                    <input required value={newCat.unit_type} onChange={e => setNewCat({...newCat, unit_type: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="e.g. kg, liters, units" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Description</label>
                    <input value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="Category description..." />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Avg Yearly Consumption (units)</label>
                    <input type="number" required min="1" value={newCat.avg_yearly_consumption} onChange={e => setNewCat({...newCat, avg_yearly_consumption: parseInt(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddCategory(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-200">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-accent text-white hover:bg-accent/90">Save Category</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <div key={category.id} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{category.unit_type}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                    {category.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <BarChart2 className="w-4 h-4" /> 
                    {category.avg_yearly_consumption} / Year
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}