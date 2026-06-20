'use client'

import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Save, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function CorporateSettingsPage() {
  const [partner, setPartner] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    async function load() {
      try {
        const p = await apiClient('/corporate/partners/me')
        setPartner(p)
        if (p) {
          setFormData({
            company_name: p.company_name || '',
            industry: p.industry || '',
            subsidy_percentage: p.subsidy_percentage || 0,
            max_employee_benefit: p.max_employee_benefit || 0,
            contact_email: p.contact_email || '',
          })
        }
      } catch (err: any) {
        if (!err.message?.toLowerCase().includes('not found')) {
          toast.error('Failed to load settings')
        }
        setIsEditing(true) // No profile yet, force edit mode
      } finally { 
        setLoading(false) 
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const method = partner ? 'PATCH' : 'POST'
      const endpoint = partner ? '/corporate/partners/me' : '/corporate/partners'
      const res = await apiClient(endpoint, {
        method,
        body: JSON.stringify(formData)
      })
      setPartner(res)
      setIsEditing(false)
      toast.success('Corporate settings updated successfully!')
    } catch (e: any) {
      toast.error(e.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-96 bg-gray-100 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">
          Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your company profile and subsidy rules
        </p>
      </div>

      {partner?.partnership_status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <h3 className="font-bold text-amber-900 uppercase tracking-tight text-sm">Account Pending Approval</h3>
            <p className="text-amber-800 text-sm mt-1">Your corporate account is currently under review by LifeKart administrators. You can configure your settings, but subsidies will not be activated until approved.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-card p-6 md:p-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-xl font-display font-bold uppercase tracking-tight">Company Profile & Subsidy Settings</h2>
          {partner && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Company Name</label>
            {isEditing ? (
              <input 
                type="text"
                value={formData.company_name}
                onChange={e => setFormData({...formData, company_name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-medium"
              />
            ) : (
              <p className="text-gray-900 font-medium py-3">{partner?.company_name}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Contact Email</label>
            {isEditing ? (
              <input 
                type="email"
                value={formData.contact_email}
                onChange={e => setFormData({...formData, contact_email: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-medium"
              />
            ) : (
              <p className="text-gray-900 font-medium py-3">{partner?.contact_email}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Subsidy Percentage (%)</label>
            {isEditing ? (
              <div className="relative">
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={formData.subsidy_percentage}
                  onChange={e => setFormData({...formData, subsidy_percentage: parseFloat(e.target.value) || 0})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-medium pr-10"
                />
                <span className="absolute right-4 top-3 text-gray-400 font-bold">%</span>
              </div>
            ) : (
              <p className="text-gray-900 font-medium py-3">{partner?.subsidy_percentage}%</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Percentage of employee's grocery bill subsidized by the company.</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Max Benefit Per Employee (₹)</label>
            {isEditing ? (
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400 font-bold">₹</span>
                <input 
                  type="number"
                  value={formData.max_employee_benefit}
                  onChange={e => setFormData({...formData, max_employee_benefit: parseFloat(e.target.value) || 0})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-medium"
                />
              </div>
            ) : (
              <p className="text-gray-900 font-medium py-3">₹{partner?.max_employee_benefit}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Cap the monthly subsidy amount per employee.</p>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            {partner && (
              <button
                onClick={() => {
                  setFormData({
                    company_name: partner.company_name || '',
                    industry: partner.industry || '',
                    subsidy_percentage: partner.subsidy_percentage || 0,
                    max_employee_benefit: partner.max_employee_benefit || 0,
                    contact_email: partner.contact_email || '',
                  })
                  setIsEditing(false)
                }}
                className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-tight rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
