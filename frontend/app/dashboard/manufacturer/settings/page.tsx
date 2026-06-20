'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function ManufacturerSettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const [formData, setFormData] = useState({
    company_name: '',
    gstin: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    contact_email: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await apiClient('/portal/manufacturer/profile')
      setProfile(data)
      setFormData({
        company_name: data.company_name || '',
        gstin: data.gstin || '',
        address_line1: data.address_line1 || '',
        address_line2: data.address_line2 || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        contact_email: data.contact_email || '',
      })
      setIsEditing(false)
    } catch (err) {
      const rawError = err instanceof Error ? err.message : String(err)
      if (!rawError.includes('404')) {
        console.error(err)
      }
      // If it's a 404, it just means they haven't created a profile yet.
      setIsEditing(true)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clean up empty strings to avoid triggering min_length validation errors on optional fields
    const payload: any = {}
    Object.entries(formData).forEach(([key, value]) => {
      if (value.trim() !== '') {
        payload[key] = value.trim()
      } else if (key === 'company_name') {
        payload[key] = value // allow company_name to fail validation naturally if empty
      }
    })

    try {
      setSaving(true)
      if (!profile) {
        // Create
        await apiClient('/portal/manufacturer/profile', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      } else {
        // Update
        await apiClient('/portal/manufacturer/profile', {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      }
      await fetchProfile()
      setIsEditing(false)
      toast.success('Profile saved successfully!')
    } catch (err) {
      console.error(err)
      const rawError = err instanceof Error ? err.message : String(err)
      let friendlyError = "Failed to save profile. Please check your information and try again."
      
      if (rawError.includes('gstin')) {
        friendlyError = "Invalid GSTIN: Please ensure your GSTIN is at least 10 characters long."
      } else if (rawError.includes('company_name')) {
        friendlyError = "Company Name is missing or too short."
      } else if (rawError.includes('contact_email')) {
        friendlyError = "Please provide a valid contact email."
      } else if (rawError.includes('pincode')) {
        friendlyError = "Please provide a valid pincode."
      }
      
      toast.error(friendlyError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">Settings</h1>
      
      <div className="bg-white rounded-2xl p-8 shadow-card max-w-3xl">
        <h2 className="text-xl font-bold mb-6 border-b pb-2 border-gray-100">Company Profile</h2>
        
        {!isEditing && profile ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Company Name</p>
                <p className="font-medium text-lg">{profile.company_name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">GSTIN</p>
                <p className="font-medium text-lg">{profile.gstin || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Contact Email</p>
                <p className="font-medium text-lg">{profile.contact_email || '—'}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-bold mt-8 mb-4 border-b pb-2 border-gray-100">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-gray-500 mb-1">Address</p>
                <p className="font-medium text-lg">
                  {profile.address_line1 || '—'}
                  {profile.address_line2 ? `, ${profile.address_line2}` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">City / State</p>
                <p className="font-medium text-lg">{(profile.city || profile.state) ? `${profile.city || ''}${profile.city && profile.state ? ', ' : ''}${profile.state || ''}` : '—'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Pincode</p>
                <p className="font-medium text-lg">{profile.pincode || '—'}</p>
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-gray-100 text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Company Name</label>
                <input 
                  type="text" 
                  name="company_name" 
                  value={formData.company_name} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">GSTIN</label>
                <input 
                  type="text" 
                  name="gstin" 
                  value={formData.gstin} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Contact Email</label>
                <input 
                  type="email" 
                  name="contact_email" 
                  value={formData.contact_email} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Address Line 2 (Optional)</label>
                <input 
                  type="text" 
                  name="address_line2" 
                  value={formData.address_line2} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                />
              </div>
            </div>

            <h3 className="text-lg font-bold mt-6 mb-4 border-b pb-2 border-gray-100">Location</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Address Line 1</label>
                <input 
                  type="text" 
                  name="address_line1" 
                  value={formData.address_line1} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold mb-1">City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">State</label>
                <input 
                  type="text" 
                  name="state" 
                  value={formData.state} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Pincode</label>
                <input 
                  type="text" 
                  name="pincode" 
                  value={formData.pincode} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                />
              </div>
            </div>

            <div className="pt-6 flex items-center gap-4">
              <button 
                type="submit" 
                disabled={saving}
                className="px-6 py-2 bg-accent text-white font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              {profile && (
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-white border-2 border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}