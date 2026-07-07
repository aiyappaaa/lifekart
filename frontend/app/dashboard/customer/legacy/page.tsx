'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { ShieldCheck, Plus, AlertCircle, CheckCircle, Clock, Trash2, ArrowRight, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LegacyPage() {
  const [nominees, setNominees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  
  const [formData, setFormData] = useState({
    nominee_name: '',
    nominee_relationship: 'spouse',
    nominee_phone: '',
    nominee_email: '',
    nominee_aadhaar: '',
    is_primary: false
  })

  const loadData = async () => {
    try {
      const data = await apiClient('/legacy/nominees')
      setNominees(data)
    } catch (err: any) {
      toast.error('Failed to load nominees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const phoneDigits = formData.nominee_phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      toast.error('Please enter a valid phone number (at least 10 digits)')
      return
    }

    if (!editingId || (formData.nominee_aadhaar && !formData.nominee_aadhaar.includes('X'))) {
      if (formData.nominee_aadhaar.length !== 12) {
        toast.error('Aadhaar number must be exactly 12 digits')
        return
      }
    }

    setSubmitting(true)

    const payload: any = { ...formData }
    // If we are editing and the Aadhaar hasn't been changed from the mask, don't send it
    if (editingId && payload.nominee_aadhaar.includes('X')) {
      delete payload.nominee_aadhaar
    } else if (editingId && !payload.nominee_aadhaar) {
      delete payload.nominee_aadhaar
    }

    try {
      if (editingId) {
        await apiClient(`/legacy/nominees/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        })
        toast.success('Nominee updated successfully')
      } else {
        await apiClient('/legacy/nominees', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        toast.success('Nominee added successfully')
      }
      setShowAddModal(false)
      setEditingId(null)
      setFormData({
        nominee_name: '',
        nominee_relationship: 'spouse',
        nominee_phone: '',
        nominee_email: '',
        nominee_aadhaar: '',
        is_primary: false
      })
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save nominee')
    } finally {
      setSubmitting(false)
    }
  }

  const openAddModal = () => {
    setEditingId(null)
    setFormData({
      nominee_name: '',
      nominee_relationship: 'spouse',
      nominee_phone: '',
      nominee_email: '',
      nominee_aadhaar: '',
      is_primary: false
    })
    setShowAddModal(true)
  }

  const openEditModal = (nominee: any) => {
    setEditingId(nominee.id)
    setFormData({
      nominee_name: nominee.nominee_name,
      nominee_relationship: nominee.nominee_relationship,
      nominee_phone: nominee.nominee_phone || '',
      nominee_email: nominee.nominee_email || '',
      nominee_aadhaar: nominee.nominee_aadhaar || '',
      is_primary: nominee.is_primary
    })
    setShowAddModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    setDeleting(true)
    try {
      await apiClient(`/legacy/nominees/${deleteConfirmId}`, { method: 'DELETE' })
      toast.success('Nominee removed')
      setDeleteConfirmId(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove nominee')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">Legacy Settings</h1>
          <p className="text-gray-500 mt-1">Assign successors to inherit your lifetime grocery subscriptions.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-tight rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" /> Add Nominee
        </button>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-accent shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-orange-900 uppercase tracking-tight mb-1">In the event of your passing</h3>
          <p className="text-sm text-orange-800 mb-3">
            Your registered nominees can securely file a death verification claim through our public portal. Once verified, your lifetime subscriptions will automatically transfer to their household at no extra cost.
          </p>
          <Link href="/legacy-claim" target="_blank" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-accent hover:text-accent/80 transition-colors">
            View Public Claim Portal <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-card overflow-hidden">
        {nominees.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-wider">No Nominees Registered</p>
            <p className="text-sm text-gray-400 mt-1">Secure your legacy by adding a trusted family member.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Nominee</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Contact Details</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Aadhaar</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Status</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {nominees.map(n => (
                  <tr key={n.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-gray-900">{n.nominee_name}</div>
                        {n.is_primary && (
                          <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{n.nominee_relationship}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-700">{n.nominee_email || '—'}</div>
                      <div className="text-xs text-gray-500">{n.nominee_phone || '—'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-mono text-gray-600 tracking-widest">
                        {n.nominee_aadhaar || 'Not Provided'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {n.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 uppercase tracking-wider">
                          <CheckCircle className="w-4 h-4" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 uppercase tracking-wider">
                          <Clock className="w-4 h-4" /> Pending Verification
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button 
                        onClick={() => openEditModal(n)}
                        className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors mr-1"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(n.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-xl font-display font-bold uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent" /> {editingId ? 'Edit Nominee' : 'Add Nominee'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Full Legal Name</label>
                <input 
                  type="text"
                  required
                  value={formData.nominee_name}
                  onChange={e => setFormData({...formData, nominee_name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Relationship</label>
                  <select
                    value={formData.nominee_relationship}
                    onChange={e => setFormData({...formData, nominee_relationship: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                  >
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Aadhaar (Encrypted)</label>
                  <input 
                    type="text"
                    required={!editingId}
                    value={formData.nominee_aadhaar}
                    onChange={e => {
                      let val = e.target.value;
                      if (!val.includes('X')) {
                        val = val.replace(/\D/g, '').slice(0, 12);
                      }
                      setFormData({...formData, nominee_aadhaar: val});
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm font-mono"
                    placeholder="12 Digit ID"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={formData.nominee_email}
                    onChange={e => setFormData({...formData, nominee_email: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Phone Number</label>
                  <input 
                    type="tel"
                    required
                    value={formData.nominee_phone}
                    onChange={e => setFormData({...formData, nominee_phone: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors mt-2">
                <input 
                  type="checkbox"
                  checked={formData.is_primary}
                  onChange={e => setFormData({...formData, is_primary: e.target.checked})}
                  className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-accent"
                />
                <div>
                  <div className="text-sm font-bold text-gray-900">Make Primary Nominee</div>
                  <div className="text-xs text-gray-500">This person will be prioritized during legacy transfers.</div>
                </div>
              </label>

              <div className="pt-4 flex gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-sm font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-accent hover:bg-accent/90 text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingId ? 'Update Nominee' : 'Save Nominee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden text-center p-8" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-display font-bold uppercase tracking-tight mb-2">Remove Nominee?</h3>
            <p className="text-sm text-gray-500 mb-8">
              Are you sure you want to remove this person? They will no longer be eligible to claim your legacy subscriptions.
            </p>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 text-sm font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {deleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
