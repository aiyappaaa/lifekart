'use client'

import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { FileText, Plus, CheckCircle, Clock, AlertTriangle, ArrowLeft, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function PayrollPage() {
  const [deductions, setDeductions] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [processModal, setProcessModal] = useState<{ id: string, ref: string } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    pay_period_start: '',
    pay_period_end: '',
    deduction_date: ''
  })

  const loadData = async () => {
    try {
      const [deds, emps] = await Promise.all([
        apiClient('/payroll/deductions').catch(err => { if (err.message?.toLowerCase().includes('not found')) return []; throw err; }),
        apiClient('/corporate/partners/me/employees').catch(err => { if (err.message?.toLowerCase().includes('not found')) return []; throw err; })
      ])
      setDeductions(deds)
      setEmployees(emps)
    } catch (err: any) {
      toast.error('Failed to load payroll data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    try {
      await apiClient('/payroll/deductions/bulk', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      toast.success('Payroll deductions generated successfully')
      setShowGenerateModal(false)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate deductions')
    } finally {
      setGenerating(false)
    }
  }

  const submitProcess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!processModal) return
    
    const id = processModal.id
    const extRef = processModal.ref
    setProcessModal(null)
    setProcessingId(id)
    
    try {
      await apiClient(`/payroll/deductions/${id}/process?external_ref=${encodeURIComponent(extRef)}`, { 
        method: 'POST' 
      })
      toast.success('Deduction marked as processed')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to process deduction')
    } finally {
      setProcessingId(null)
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
      <div>
        <Link href="/dashboard/corporate" className="inline-flex items-center text-sm font-bold text-accent hover:text-accent/80 transition-colors uppercase tracking-widest mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">Payroll Deductions</h1>
            <p className="text-gray-500 mt-1">Generate automated employee salary deductions for their grocery subscriptions.</p>
          </div>
          <button 
            onClick={() => {
              // Pre-fill with current month dates
              const now = new Date()
              const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
              const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
              setFormData({
                pay_period_start: firstDay.toISOString().split('T')[0],
                pay_period_end: lastDay.toISOString().split('T')[0],
                deduction_date: new Date().toISOString().split('T')[0]
              })
              setShowGenerateModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-tight rounded-xl transition-all shadow-sm"
          >
            <FileText className="w-5 h-5" /> Generate Bulk File
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 flex items-center justify-between">
           <div>
             <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending Processing</span>
             <div className="text-3xl font-display font-extrabold text-amber-900 mt-2">
               {deductions.filter(d => d.status === 'pending').length}
             </div>
           </div>
           <Clock className="w-8 h-8 text-amber-200" />
         </div>
         <div className="bg-green-50 rounded-2xl p-6 border border-green-200 flex items-center justify-between">
           <div>
             <span className="text-xs font-bold uppercase tracking-wider text-green-600">Processed Files</span>
             <div className="text-3xl font-display font-extrabold text-green-900 mt-2">
               {deductions.filter(d => d.status === 'processed').length}
             </div>
           </div>
           <CheckCircle className="w-8 h-8 text-green-200" />
         </div>
      </div>

      <div className="bg-white rounded-3xl shadow-card overflow-hidden">
        {deductions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-wider">No Deductions Generated</p>
            <p className="text-sm text-gray-400 mt-1">Generate your first bulk payroll deduction file to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Employee</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Pay Period</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Subsidy / Deduct</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Status</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deductions.map(d => {
                  const emp = employees.find(e => e.id === d.employee_enrollment_id)
                  return (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900">{emp?.employee_id || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{emp?.department || '—'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-700">
                          {new Date(d.pay_period_start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(d.pay_period_end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-400">Due: {new Date(d.deduction_scheduled_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="text-xs text-green-600 font-bold mb-0.5">₹{Number(d.employer_subsidy).toLocaleString('en-IN')} (Subsidy)</div>
                        <div className="font-bold text-gray-900">₹{Number(d.amount_deducted).toLocaleString('en-IN')}</div>
                      </td>
                      <td className="py-4 px-6">
                        {d.status === 'processed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider border border-green-200">
                            <CheckCircle className="w-3 h-3" /> Processed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider border border-amber-200">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {d.external_ref && <div className="text-xs text-gray-400 font-mono mt-1">Ref: {d.external_ref}</div>}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {d.status === 'pending' && (
                          <button 
                            onClick={() => setProcessModal({ id: d.id, ref: '' })}
                            disabled={processingId === d.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Upload className="w-3 h-3" /> {processingId === d.id ? '...' : 'Mark Uploaded'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-xl font-display font-bold uppercase tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" /> Generate Payroll File
              </h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="p-6 space-y-5">
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-2">
                <p className="text-sm text-blue-800">
                  This action will calculate the total grocery subscription cost for all enrolled employees during the specified pay period, apply your company's subsidy, and generate the final deduction amount.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Pay Period Start</label>
                  <input 
                    type="date"
                    required
                    value={formData.pay_period_start}
                    onChange={e => setFormData({...formData, pay_period_start: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Pay Period End</label>
                  <input 
                    type="date"
                    required
                    value={formData.pay_period_end}
                    onChange={e => setFormData({...formData, pay_period_end: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Target Deduction Date</label>
                <input 
                  type="date"
                  required
                  value={formData.deduction_date}
                  onChange={e => setFormData({...formData, deduction_date: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 py-3 text-sm font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={generating}
                  className="flex-1 py-3 bg-accent hover:bg-accent/90 text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {generating ? 'Calculating...' : 'Run Engine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Modal */}
      {processModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setProcessModal(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-xl font-display font-bold uppercase tracking-tight flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" /> Mark as Processed
              </h3>
              <button onClick={() => setProcessModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={submitProcess} className="p-6 space-y-5">
              <p className="text-sm text-gray-500">
                You are about to mark this deduction as successfully processed in your HRMS/Payroll system.
              </p>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  HRMS/Payroll External Reference ID
                </label>
                <input 
                  type="text"
                  placeholder="e.g. TXN-998 (Optional)"
                  value={processModal.ref}
                  onChange={e => setProcessModal({ ...processModal, ref: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm font-mono"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setProcessModal(null)}
                  className="flex-1 py-3 text-sm font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-accent hover:bg-accent/90 text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-sm transition-colors"
                >
                  Confirm Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
