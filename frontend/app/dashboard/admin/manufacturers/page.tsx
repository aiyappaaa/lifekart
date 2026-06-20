'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { Building2, CheckCircle2, XCircle } from 'lucide-react'

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedManufacturer, setSelectedManufacturer] = useState<any>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'verify' | 'suspend', id: string } | null>(null)

  useEffect(() => {
    fetchManufacturers()
  }, [])

  const fetchManufacturers = async () => {
    try {
      setLoading(true)
      const data = await apiClient('/catalog/manufacturers?limit=100')
      setManufacturers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load manufacturers')
    } finally {
      setLoading(false)
    }
  }

  const initiateVerify = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmAction({ type: 'verify', id })
  }

  const initiateSuspend = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmAction({ type: 'suspend', id })
  }

  const executeAction = async () => {
    if (!confirmAction) return

    try {
      if (confirmAction.type === 'verify') {
        await apiClient(`/catalog/manufacturers/${confirmAction.id}/verify`, { method: 'POST' })
        toast.success('Manufacturer verified successfully.')
      } else {
        await apiClient(`/catalog/manufacturers/${confirmAction.id}/status`, { 
          method: 'PATCH',
          body: JSON.stringify({ is_verified: false })
        })
        toast.success('Manufacturer suspended successfully.')
      }
      fetchManufacturers()
    } catch (err) {
      toast.error(`Failed to ${confirmAction.type} manufacturer.`)
    } finally {
      setConfirmAction(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">Manufacturers</h1>
          <p className="text-gray-500 mt-1">Review and verify factory accounts</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card">
        {loading ? (
          <div className="text-center py-12 text-gray-400 font-semibold animate-pulse">Loading manufacturers...</div>
        ) : manufacturers.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-semibold">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No manufacturers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-gray-500 uppercase text-xs font-bold">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Company Name</th>
                  <th className="px-4 py-3">Support Email</th>
                  <th className="px-4 py-3">GSTIN</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {manufacturers.map((m) => (
                  <tr 
                    key={m.id} 
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedManufacturer(m)}
                  >
                    <td className="px-4 py-4 font-bold text-gray-900">{m.company_name}</td>
                    <td className="px-4 py-4 text-gray-600">{m.support_email}</td>
                    <td className="px-4 py-4 font-mono text-xs">{m.gstin}</td>
                    <td className="px-4 py-4">
                      {m.is_verified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          <XCircle className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {!m.is_verified ? (
                        <button
                          onClick={(e) => initiateVerify(m.id, e)}
                          className="bg-green-600 text-white hover:bg-green-700 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Verify
                        </button>
                      ) : (
                        <button
                          onClick={(e) => initiateSuspend(m.id, e)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manufacturer Details Modal */}
      {selectedManufacturer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedManufacturer(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-display font-extrabold">{selectedManufacturer.company_name}</h2>
              <button onClick={() => setSelectedManufacturer(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Company Information</h3>
                  <div className="space-y-3 text-sm">
                    <p><span className="text-gray-500 font-medium">GSTIN:</span> <span className="font-mono bg-gray-50 px-2 py-0.5 rounded text-xs">{selectedManufacturer.gstin}</span></p>
                    <p><span className="text-gray-500 font-medium">Support Email:</span> {selectedManufacturer.support_email}</p>
                    <p><span className="text-gray-500 font-medium">Joined:</span> {new Date(selectedManufacturer.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location Details</h3>
                  <div className="space-y-3 text-sm">
                    <p><span className="text-gray-500 font-medium">Address:</span> {selectedManufacturer.address_line1} {selectedManufacturer.address_line2}</p>
                    <p><span className="text-gray-500 font-medium">City:</span> {selectedManufacturer.city}</p>
                    <p><span className="text-gray-500 font-medium">State:</span> {selectedManufacturer.state}</p>
                    <p><span className="text-gray-500 font-medium">Pincode:</span> {selectedManufacturer.pincode}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedManufacturer(null)}
                  className="px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setConfirmAction(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-8 text-center" onClick={e => e.stopPropagation()}>
            {confirmAction.type === 'verify' ? (
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8" />
              </div>
            )}
            
            <h2 className="text-2xl font-display font-extrabold mb-2">
              {confirmAction.type === 'verify' ? 'Verify Manufacturer?' : 'Suspend Manufacturer?'}
            </h2>
            <p className="text-gray-500 mb-8">
              {confirmAction.type === 'verify' 
                ? 'This will unlock their account and allow them to upload products and accept life-time contracts.'
                : 'This will immediately revoke their access and hide their catalog from the platform.'}
            </p>

            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setConfirmAction(null)}
                className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors w-full"
              >
                Cancel
              </button>
              <button 
                onClick={executeAction}
                className={`px-6 py-3 rounded-xl font-bold text-white transition-colors shadow-sm w-full ${
                  confirmAction.type === 'verify' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmAction.type === 'verify' ? 'Yes, Verify' : 'Yes, Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
