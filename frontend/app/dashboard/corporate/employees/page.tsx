'use client'

import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Users, Plus, Trash2, Search, Building2, Briefcase, ArrowLeft, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  
  const [formData, setFormData] = useState({
    household_id: '',
    employee_id: '',
    department: '',
    designation: ''
  })

  const loadEmployees = async () => {
    try {
      const data = await apiClient('/corporate/partners/me/employees')
      setEmployees(data)
    } catch (err: any) {
      if (!err.message?.toLowerCase().includes('not found')) {
        toast.error('Failed to load employees')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnrolling(true)
    try {
      if (editMode && selectedId) {
        await apiClient(`/corporate/employees/${selectedId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            employee_id: formData.employee_id,
            department: formData.department,
            designation: formData.designation
          })
        })
        toast.success('Employee updated successfully')
      } else {
        await apiClient('/corporate/partners/me/employees', {
          method: 'POST',
          body: JSON.stringify(formData)
        })
        toast.success('Employee enrolled successfully')
      }
      setShowModal(false)
      setEditMode(false)
      setSelectedId(null)
      setFormData({ household_id: '', employee_id: '', department: '', designation: '' })
      loadEmployees()
    } catch (err: any) {
      toast.error(err.message || 'Failed to enroll employee')
    } finally {
      setEnrolling(false)
    }
  }

  const handleRemove = async (enrollmentId: string) => {
    if (!window.confirm("Are you sure you want to revoke this employee's corporate subsidy?")) return;
    try {
      await apiClient(`/corporate/employees/${enrollmentId}`, { method: 'DELETE' })
      toast.success('Employee subsidy revoked')
      loadEmployees()
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove employee')
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
            <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">Employee Roster</h1>
            <p className="text-gray-500 mt-1">Manage corporate subsidies for your staff.</p>
          </div>
          <button 
            onClick={() => {
              setEditMode(false)
              setSelectedId(null)
              setFormData({ household_id: '', employee_id: '', department: '', designation: '' })
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-tight rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" /> Enroll Employee
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-card overflow-hidden">
        {employees.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-wider">No Employees Enrolled</p>
            <p className="text-sm text-gray-400 mt-1">Click the button above to onboard your first employee.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Employee ID</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Department & Role</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Enrolled Date</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{emp.employee_id}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5" title="Household ID">{emp.household_id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-700">{emp.department || '—'}</div>
                      <div className="text-xs text-gray-500">{emp.designation || '—'}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(emp.enrolled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => {
                            setEditMode(true)
                            setSelectedId(emp.id)
                            setFormData({
                              household_id: emp.household_id,
                              employee_id: emp.employee_id || '',
                              department: emp.department || '',
                              designation: emp.designation || ''
                            })
                            setShowModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-accent hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleRemove(emp.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Revoke Subsidy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-xl font-display font-bold uppercase tracking-tight">
                {editMode ? 'Edit Employee Details' : 'Enroll Employee'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleEnroll} className="p-6 space-y-5">
              
              {!editMode && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-2">
                  <p className="text-sm text-blue-800">
                    <strong className="font-bold">Note:</strong> The employee must already have a LifeKart Household account. Enter their unique Household ID below to link their account to your corporate subsidy.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Household ID (UUID) {editMode ? '' : '*'}</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-4 top-3.5 text-gray-400" />
                  <input 
                    type="text"
                    required={!editMode}
                    disabled={editMode}
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                    value={formData.household_id}
                    onChange={e => setFormData({...formData, household_id: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono text-sm disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Internal Employee ID *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. EMP-1042"
                  value={formData.employee_id}
                  onChange={e => setFormData({...formData, employee_id: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-medium text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Department</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Engineering"
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Designation</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Senior Engineer"
                      value={formData.designation}
                      onChange={e => setFormData({...formData, designation: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-sm font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={enrolling}
                  className="flex-1 py-3 bg-accent hover:bg-accent/90 text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {enrolling ? 'Saving...' : (editMode ? 'Save Changes' : 'Enroll Employee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}