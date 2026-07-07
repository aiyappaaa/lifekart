'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { ShieldCheck, FileText, CheckCircle2, XCircle } from 'lucide-react'

export default function LegacyQueuePage() {
  const [activeTab, setActiveTab] = useState<'claims' | 'kyc'>('claims')
  const [activations, setActivations] = useState<any[]>([])
  const [nominees, setNominees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmApprove, setConfirmApprove] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'pending_verification' | 'completed' | 'rejected'>('pending_verification')
  const [rejectActivationId, setRejectActivationId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchData()
  }, [statusFilter])

  const fetchData = async () => {
    try {
      const [activationsData, nomineesData] = await Promise.all([
        apiClient(`/legacy/activations?status=${statusFilter}`),
        apiClient('/legacy/admin/nominees')
      ])
      setActivations(Array.isArray(activationsData) ? activationsData : [])
      setNominees(Array.isArray(nomineesData) ? nomineesData : [])
    } catch (err) {
      toast.error('Failed to load legacy data.')
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
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute transfer')
    } finally {
      setConfirmApprove(null)
    }
  }

  const handleVerifyNominee = async (id: string) => {
    try {
      await apiClient(`/legacy/admin/nominees/${id}/verify`, { method: 'POST' })
      toast.success('Nominee KYC verified')
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify nominee')
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectActivationId || !rejectionReason.trim()) return
    try {
      await apiClient(`/legacy/activations/${rejectActivationId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejection_reason: rejectionReason })
      })
      toast.success('Claim rejected successfully')
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject claim')
    } finally {
      setRejectActivationId(null)
      setRejectionReason('')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">Legacy & Claims</h1>
        <p className="text-gray-500 mt-1">Review death verification claims and approve 60-year subscription transfers.</p>
      </div>

      <div className="flex items-center gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-4 font-bold uppercase tracking-widest text-sm border-b-2 transition-colors ${
            activeTab === 'claims' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Death Claims ({activations.length})
        </button>
        <button
          onClick={() => setActiveTab('kyc')}
          className={`pb-4 font-bold uppercase tracking-widest text-sm border-b-2 transition-colors ${
            activeTab === 'kyc' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Nominee KYC ({nominees.length})
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 min-h-[500px]">
        {activeTab === 'claims' && (
          <div className="mb-6 flex justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Filter:</span>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-lg focus:ring-accent focus:border-accent block p-2 outline-none cursor-pointer"
              >
                <option value="pending_verification">Pending</option>
                <option value="completed">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'claims' && (
          loading ? (
            <div className="text-center text-gray-400 py-20 animate-pulse">Loading queue...</div>
          ) : activations.length === 0 ? (
            <div className="text-center py-20">
              <ShieldCheck className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Queue is Empty</h3>
              <p className="text-gray-500">
                {statusFilter === 'pending_verification' 
                  ? 'No pending legacy claims require verification right now.'
                  : `No ${statusFilter === 'completed' ? 'approved' : 'rejected'} claims found.`}
              </p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Date Submitted</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Deceased Account</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Nominee Details</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Document</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activations.map(activation => (
                  <tr key={activation.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(activation.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-green-600 font-bold mt-1 bg-green-50 inline-block px-2 py-0.5 rounded">
                        {activation.active_subscriptions_count} Subs
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 font-medium">{activation.deceased_email || 'Unknown'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-gray-900">
                        {activation.successor_nominee?.nominee_name || 'Unknown'} <span className="text-gray-400 font-normal capitalize">- {activation.successor_nominee?.nominee_relationship || 'Beneficiary'}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {activation.successor_nominee?.nominee_email || activation.successor_nominee?.nominee_phone || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        {activation.death_certificate_url ? (
                          <a 
                            href={activation.death_certificate_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors whitespace-nowrap self-start"
                          >
                            <FileText className="w-4 h-4" /> View Certificate
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No Document</span>
                        )}
                        {statusFilter === 'rejected' && activation.rejection_reason && (
                          <div className="text-xs text-red-600 mt-1">
                            <span className="font-bold">Reason:</span> {activation.rejection_reason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {statusFilter === 'pending_verification' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setRejectActivationId(activation.id)}
                            className="px-4 py-2 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
                          >
                            Reject Claim
                          </button>
                          <button 
                            onClick={() => setConfirmApprove(activation.id)}
                            className="px-4 py-2 bg-accent text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-accent/90 transition-colors shadow-sm whitespace-nowrap"
                          >
                            Approve Transfer
                          </button>
                        </div>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                          statusFilter === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {statusFilter === 'completed' ? 'Approved' : 'Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )
        )}

        {activeTab === 'kyc' && (
          loading ? (
            <div className="text-center text-gray-400 py-12 animate-pulse">Loading queue...</div>
          ) : nominees.length === 0 ? (
            <div className="text-center py-20">
              <CheckCircle2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Pending KYC</h3>
              <p className="text-gray-500">All legacy nominees have been verified.</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Nominee</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Contact</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Aadhaar</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {nominees.map(n => (
                  <tr key={n.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{n.nominee_name}</div>
                      <div className="text-xs text-gray-500 capitalize">{n.nominee_relationship}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-700">{n.nominee_email || '—'}</div>
                      <div className="text-xs text-gray-500">{n.nominee_phone || '—'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-mono text-gray-600 tracking-widest">
                        {n.nominee_aadhaar || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleVerifyNominee(n.id)}
                        className="px-4 py-2 bg-accent text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-accent/90 transition-colors shadow-sm whitespace-nowrap"
                      >
                        Verify KYC
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )
        )}
      </div>

      {/* Reject Modal */}
      {rejectActivationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-gray-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Reject Claim
              </h3>
              <button 
                onClick={() => { setRejectActivationId(null); setRejectionReason(''); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleReject} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. The death certificate is blurry and unreadable. Please upload a clear scan."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-accent focus:border-accent outline-none text-sm transition-all resize-none h-32"
                  required
                  minLength={10}
                />
                <p className="text-xs text-gray-500 mt-2">
                  This reason will be recorded for audit purposes. The nominee will need to submit a new claim.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => { setRejectActivationId(null); setRejectionReason(''); }}
                  className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={rejectionReason.length < 10}
                  className="flex-1 px-4 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Modal */}
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
