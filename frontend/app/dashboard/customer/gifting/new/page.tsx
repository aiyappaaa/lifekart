'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Loader2, Sparkles, Package, ShieldCheck, Heart } from 'lucide-react'

export default function NewGiftOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [maxLifetimeYears, setMaxLifetimeYears] = useState(60)
  const [products, setProducts] = useState<any[]>([])

  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [beneficiaryDob, setBeneficiaryDob] = useState('')
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState('child')
  
  // Selected items: productId -> { frequency_days, quantity_per_delivery }
  const [selectedItems, setSelectedItems] = useState<Record<string, { frequency: number, quantity: number }>>({})

  useEffect(() => {
    async function load() {
      try {
        const [configRes, productsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/analytics/public/config`).catch(() => null),
          apiClient('/catalog/products')
        ])
        
        if (configRes && configRes.ok) {
          const config = await configRes.json()
          setMaxLifetimeYears(config.max_lifetime_years || 60)
        }
        
        setProducts(Array.isArray(productsRes) ? productsRes : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function calculateAges() {
    if (!beneficiaryDob) return { start: 0, end: maxLifetimeYears }
    const dob = new Date(beneficiaryDob)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
      age--
    }
    return {
      start: age,
      end: age + maxLifetimeYears
    }
  }

  const { start, end } = calculateAges()

  function toggleProduct(productId: string) {
    setSelectedItems(prev => {
      const next = { ...prev }
      if (next[productId]) {
        delete next[productId]
      } else {
        next[productId] = { frequency: 30, quantity: 1 }
      }
      return next
    })
  }

  function updateItem(productId: string, field: 'frequency' | 'quantity', value: number) {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (Object.keys(selectedItems).length === 0) {
      setError('Please select at least one essential to include in the gift.')
      return
    }

    setSubmitting(true)

    const payload = {
      beneficiary_name: beneficiaryName,
      beneficiary_dob: beneficiaryDob,
      beneficiary_relationship: beneficiaryRelationship,
      end_age: end,
      items: Object.entries(selectedItems).map(([productId, cfg]) => ({
        product_id: productId,
        age_trigger: start, // for simple V1, starts immediately
        size_progression: {},
        frequency_days: cfg.frequency,
        quantity_per_delivery: cfg.quantity
      }))
    }

    try {
      const res = await apiClient('/gifting/', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      router.push(`/dashboard/customer/gifting/${res.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create gift order')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link
        href="/dashboard/customer/gifting"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-accent transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Gifting
      </Link>

      <div>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">
          Create a Lifetime Gift
        </h1>
        <p className="text-gray-500 mt-2">
          Secure a {maxLifetimeYears}-year supply of essentials locked in at today's wholesale price.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-display font-bold uppercase tracking-tight">Beneficiary Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={beneficiaryName}
                onChange={e => setBeneficiaryName(e.target.value)}
                className="w-full px-4 py-3 bg-surface-muted rounded-xl border-none focus:ring-2 focus:ring-accent"
                placeholder="e.g. Sarah Connor"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Relationship</label>
              <select
                value={beneficiaryRelationship}
                onChange={e => setBeneficiaryRelationship(e.target.value)}
                className="w-full px-4 py-3 bg-surface-muted rounded-xl border-none focus:ring-2 focus:ring-accent"
              >
                <option value="child">Child</option>
                <option value="grandchild">Grandchild</option>
                <option value="niece">Niece</option>
                <option value="nephew">Nephew</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={beneficiaryDob}
                onChange={e => setBeneficiaryDob(e.target.value)}
                className="w-full px-4 py-3 bg-surface-muted rounded-xl border-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          
          {beneficiaryDob && (
            <div className="mt-6 bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center gap-4">
              <Sparkles className="w-6 h-6 text-accent" />
              <div>
                <p className="font-semibold text-accent">Lifetime Coverage Calculated</p>
                <p className="text-sm text-gray-600">
                  This gift will provide essentials from their current age ({start}) up to age <strong className="text-gray-900">{end}</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-display font-bold uppercase tracking-tight">Select Essentials</h2>
            </div>
            <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {Object.keys(selectedItems).length} Selected
            </span>
          </div>

          <div className="space-y-4">
            {products.map(product => {
              const isSelected = !!selectedItems[product.id]
              return (
                <div key={product.id} className={`border rounded-xl transition-all ${isSelected ? 'border-accent ring-1 ring-accent' : 'border-gray-200'}`}>
                  <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => toggleProduct(product.id)}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      readOnly
                      className="w-5 h-5 text-accent rounded focus:ring-accent"
                    />
                    <div className="flex-1">
                      <p className="font-bold">{product.name}</p>
                      <p className="text-xs text-gray-500">₹{product.unit_price_wholesale} wholesale price</p>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 rounded-b-xl grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity per Delivery</label>
                        <input
                          type="number"
                          min="1"
                          step="0.5"
                          value={selectedItems[product.id].quantity}
                          onChange={e => updateItem(product.id, 'quantity', parseFloat(e.target.value) || 1)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-accent outline-none"
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Delivery Frequency</label>
                        <select
                          value={selectedItems[product.id].frequency}
                          onChange={e => updateItem(product.id, 'frequency', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-accent outline-none"
                          onClick={e => e.stopPropagation()}
                        >
                          <option value="7">Every Week</option>
                          <option value="15">Every 15 Days</option>
                          <option value="30">Every Month</option>
                          <option value="60">Every 2 Months</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl
                       shadow-button hover:shadow-button-hover transition-all disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            {submitting ? 'Generating Contract...' : `Lock in ${maxLifetimeYears}-Year Supply`}
          </button>
        </div>
      </form>
    </div>
  )
}
