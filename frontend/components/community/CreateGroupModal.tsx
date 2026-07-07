'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Users, TrendingDown, Lock, Globe } from 'lucide-react'
import { apiClient } from '@/lib/api'

interface Tier {
  name: string
  threshold: number
  discount_pct: number
}

interface CreateGroupModalProps {
  onClose: () => void
  onSuccess: () => void
  initialPincode: string
  initialCity: string
  initialState: string
}

export function CreateGroupModal({ onClose, onSuccess, initialPincode, initialCity, initialState }: CreateGroupModalProps) {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tiers, setTiers] = useState<Tier[]>([])
  const [error, setError] = useState('')
  const [interceptionCount, setInterceptionCount] = useState<number | null>(null)

  const [form, setForm] = useState({
    name: '',
    locality: '',
    city: initialCity,
    state: initialState,
    pincode: initialPincode,
    min_households_for_pooling: 10,
    is_private: false,
  })

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await apiClient('/community/config')
        if (config?.tiers) {
          setTiers(config.tiers)
          setForm(prev => ({ ...prev, min_households_for_pooling: config.tiers[0].threshold }))
        }
      } catch (e) {
        console.error('Failed to load community config', e)
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Interception Check
    if (interceptionCount === null && !form.is_private) {
      setSubmitting(true)
      try {
        const groups = await apiClient(`/community/groups?pincode=${form.pincode}`)
        if (Array.isArray(groups) && groups.length > 0) {
          setInterceptionCount(groups.length)
          setSubmitting(false)
          return
        }
      } catch (e) {
        // Ignore and proceed if API fails
      }
    }

    setSubmitting(true)
    setError('')
    try {
      await apiClient('/community/groups', {
        method: 'POST',
        body: JSON.stringify(form)
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create group')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight">Form a Pool</h2>
            <p className="text-gray-500 text-sm mt-1">Create a neighborhood group to unlock wholesale pricing.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{error}</div>}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Group Name (Be Specific!)</label>
                <input
                  type="text" required placeholder="e.g., Prestige Falcon City - Tower 3"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Locality</label>
                  <input
                    type="text" required placeholder="e.g., Whitefield"
                    value={form.locality} onChange={e => setForm({...form, locality: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pincode</label>
                  <input
                    type="text" required placeholder="560066"
                    value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Pooling Tier</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers.map(tier => (
                  <div
                    key={tier.threshold}
                    onClick={() => setForm({...form, min_households_for_pooling: tier.threshold})}
                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      form.min_households_for_pooling === tier.threshold 
                        ? 'border-accent bg-accent/5 shadow-md' 
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900">{tier.name}</span>
                      {form.min_households_for_pooling === tier.threshold && (
                        <div className="w-2.5 h-2.5 bg-accent rounded-full" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm mb-1">
                      <Users className="w-4 h-4" /> {tier.threshold} Households
                    </div>
                    <div className="flex items-center gap-1.5 text-green-600 text-sm font-bold">
                      <TrendingDown className="w-4 h-4" /> {tier.discount_pct}% Discount
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  {form.is_private ? <Lock className="w-4 h-4 text-accent" /> : <Globe className="w-4 h-4 text-gray-500" />}
                  {form.is_private ? 'Private Pool' : 'Public Pool'}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {form.is_private ? 'Only people with the invite link can join.' : 'Anyone in this pincode can discover and join.'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={form.is_private} onChange={e => setForm({...form, is_private: e.target.checked})} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            {interceptionCount !== null ? (
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 mb-6">
                <h4 className="font-bold text-amber-900 mb-2 text-lg">Wait! Did you mean...</h4>
                <p className="text-amber-800 text-sm mb-4">
                  We found <strong>{interceptionCount} existing pools</strong> in pincode {form.pincode}. Joining an existing pool helps everyone unlock wholesale pricing faster!
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-white border border-amber-200 text-amber-900 font-bold rounded-xl hover:bg-amber-100 transition-colors">
                    Join an Existing Pool
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 px-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'No, Create My Own'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-8 py-3 bg-accent text-white font-bold rounded-xl shadow-button hover:shadow-button-hover transition-all disabled:opacity-50">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Group'}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
