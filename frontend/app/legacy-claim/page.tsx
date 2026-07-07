'use client'

import { useState } from 'react'
import { ShieldCheck, ArrowRight, UploadCloud, AlertCircle, FileText } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function LegacyClaimPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [fileName, setFileName] = useState('')
  const [formData, setFormData] = useState({
    deceased_email: '',
    nominee_email: '',
    death_proof_type: 'death_certificate',
    proof_document_url: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.deceased_email.trim() || !formData.nominee_email.trim()) {
      toast.error('Please enter both the Account Holder\'s Email and Your Nominee Email.')
      return
    }

    if (!formData.proof_document_url) {
      toast.error('Please attach a proof document before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/legacy/public-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to submit claim')
      }

      setSuccess(true)
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while filing the claim.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-card text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">Claim Submitted</h2>
          <p className="text-gray-500 mb-8 text-sm">
            Your legacy claim has been successfully filed. Our compliance team will review the documentation and contact you shortly. We offer our deepest condolences during this difficult time.
          </p>
          <Link 
            href="/"
            className="block w-full py-3 bg-gray-900 hover:bg-black text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-white font-black text-xl leading-none">L</span>
          </div>
          <span className="text-2xl font-display font-black tracking-tighter">LIFE<span className="text-accent">KART</span></span>
        </Link>
      </div>

      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-display font-extrabold uppercase tracking-tighter text-gray-900">
            Legacy & Subscriptions Claim
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Securely verify the passing of an account holder to transfer their lifetime grocery subscriptions to your household.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-card border border-gray-100">
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              You must be registered as a valid nominee on the deceased's account. We will verify your email address against our records before processing this claim.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Account Holder's Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.deceased_email}
                  onChange={e => setFormData({...formData, deceased_email: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                  placeholder="deceased@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Your Nominee Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.nominee_email}
                  onChange={e => setFormData({...formData, nominee_email: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Proof of Passing</label>
              <select 
                value={formData.death_proof_type}
                onChange={e => setFormData({...formData, death_proof_type: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
              >
                <option value="death_certificate">Official Death Certificate</option>
                <option value="court_order">Court Order</option>
                <option value="hospital_record">Hospital Record</option>
                <option value="govt_notification">Government Notification</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Upload Document</label>
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setFileName(e.target.files[0].name)
                      // For demonstration purposes, we map the uploaded file to a public dummy PDF
                      // so that the Superadmin can actually open and view it in the admin dashboard.
                      setFormData({...formData, proof_document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'})
                    }
                  }}
                />
                <UploadCloud className={`w-8 h-8 mx-auto mb-2 transition-colors ${fileName ? 'text-green-500' : 'text-gray-400 group-hover:text-accent'}`} />
                {fileName ? (
                  <span className="text-sm font-bold text-gray-900">{fileName}</span>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-600">Click to upload or drag & drop</span>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, or PNG (Max 5MB)</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Additional Notes (Optional)</label>
              <textarea 
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm resize-none"
                placeholder="Any specific instructions or details..."
              />
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-accent hover:bg-accent/90 text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-accent/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Submitting Claim...' : 'Submit Verification Claim'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
        
        <p className="text-center text-xs text-gray-400">
          For assistance with the claims process, please contact <a href="mailto:support@lifekart.com" className="underline hover:text-gray-600">support@lifekart.com</a> or call 1-800-LIFERKT.
        </p>
      </div>
    </div>
  )
}
