'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { ShieldCheck, FileText, CheckCircle2, XCircle } from 'lucide-react'

export default function LegacyQueuePage() {
  const [activations, setActivations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmApprove, setConfirmApprove] = useState<string | null>(null)

  useEffect(() => {
    fetchActivations()
  }, [])

  const fetchActivations = async () => {
    try {
      const data = await apiClient('/legacy/activations')
      setActivations(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Failed to load legacy claims.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!confirmApprove) return
    try {
      await apiClient(`/legacy/activations/${confirmApprove}/approve`, {
        method: 'POST'
      })
      toast.success('Transfer executed successfully')
      fetchActivations()
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute transfer')
    } finally {
      setConfirmApprove(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">Legacy & Claims</h1>
        <p className="text-gray-500 mt-1">Review death verification claims and approve 60-year subscription transfers.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 min-h-[500px]">
        {loading ? (
          <div className="text-center text-gray-400 py-20 animate-pulse">Loading queue...</div>
        ) : activations.length === 0 ? (
          <div className="text-center py-20">
            <ShieldCheck className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">Queue is Empty</h3>
            <p className="text-gray-500">No pending legacy claims require verification right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activations.map((activation) => (
              <div key={activation.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Pending Verification</div>
                      <h3 className="text-lg font-display font-bold text-gray-900">{activation.nominee?.nominee_name || 'Unknown Nominee'}</h3>
                      <p className="text-sm text-gray-500 capitalize">{activation.nominee?.nominee_relationship || 'Beneficiary'}</p>
                    </div>
                    {activation.death_certificate_url && (
                      <a 
                        href={activation.death_certificate_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-4 h-4" /> View Proof
                      </a>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Masked Aadhaar:</span>
                      <span className="font-mono font-bold">{activation.nominee?.nominee_aadhaar || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Contact:</span>
                      <span className="font-bold">{activation.nominee?.nominee_phone || activation.nominee?.nominee_email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-gray-200">
                      <span className="text-gray-500 font-bold uppercase text-xs">Contract Payload</span>
                      <span className="font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                        {activation.active_subscriptions_count} Active Subs to Transfer
                      </span>
                    </div>
                    {activation.activation_notes && (
                      <div className="bg-white p-3 rounded-lg border border-gray-100 text-xs text-gray-600 mt-2 italic">
                        "{activation.activation_notes}"
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setConfirmApprove(activation.id)}
                  className="w-full bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5" /> Approve & Execute Transfer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setConfirmApprove(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-8 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-display font-extrabold mb-2">
              Execute Legacy Transfer?
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
              This action is permanent. The original account will be deactivated, and all active subscriptions will be seamlessly transferred to a newly created household for the nominee.
            </p>

            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setConfirmApprove(null)}
                className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors w-full"
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove}
                className="px-6 py-3 rounded-xl font-bold text-white transition-colors shadow-sm w-full bg-green-600 hover:bg-green-700"
              >
                Yes, Execute Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
