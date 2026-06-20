'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { Users as UsersIcon, ShieldAlert, ShieldCheck, Mail, Calendar, KeyRound, Ban } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Role Modal State
  const [roleModalUser, setRoleModalUser] = useState<any>(null)
  const [selectedRole, setSelectedRole] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [roleFilter])

  const fetchData = async () => {
    try {
      const query = roleFilter === 'all' ? '?limit=200' : `?limit=200&role=${roleFilter}`
      const [usersData, meData] = await Promise.all([
        apiClient(`/auth/users${query}`),
        apiClient('/auth/me')
      ])
      setUsers(Array.isArray(usersData) ? usersData : [])
      setCurrentUser(meData)
    } catch (err) {
      toast.error('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (user: any) => {
    try {
      await apiClient(`/auth/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !user.is_active })
      })
      toast.success(`User ${!user.is_active ? 'activated' : 'suspended'}`)
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status')
    }
  }

  const openRoleModal = (user: any) => {
    setRoleModalUser(user)
    setSelectedRole(user.role)
  }

  const handleRoleChange = async () => {
    if (!roleModalUser || !selectedRole || roleModalUser.role === selectedRole) {
      setRoleModalUser(null)
      return
    }
    
    try {
      await apiClient(`/auth/users/${roleModalUser.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: selectedRole })
      })
      toast.success(`Role updated to ${selectedRole}`)
      setRoleModalUser(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user role')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">Platform Users</h1>
        <p className="text-gray-500 mt-1">Manage all registered accounts, roles, and access controls.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6 w-fit overflow-x-auto">
          {['all', 'superadmin', 'manufacturer', 'corporate_admin', 'customer'].map(r => (
            <button 
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap ${
                roleFilter === r ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r === 'all' ? 'All Users' : r.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20 animate-pulse">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <UsersIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Users Found</h3>
            <p className="text-gray-500">There are no registered users on the platform yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">User Details</th>
                  <th className="pb-3 font-bold">Role</th>
                  <th className="pb-3 font-bold">Joined</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{user.full_name}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'manufacturer' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'corporate_admin' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`font-bold ${user.is_active ? 'text-green-700' : 'text-red-700'}`}>
                          {user.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        {currentUser?.id === user.id ? (
                          <span className="text-xs text-gray-400 font-bold px-2 py-1 bg-gray-100 rounded">It's You</span>
                        ) : (
                          <>
                            <button
                              onClick={() => openRoleModal(user)}
                              title="Change Role"
                              className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleStatus(user)}
                              title={user.is_active ? "Suspend User" : "Activate User"}
                              className={`p-2 rounded-lg transition-colors ${
                                user.is_active 
                                  ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {user.is_active ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Assignment Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setRoleModalUser(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-display font-extrabold mb-1">Assign Role</h2>
            <p className="text-gray-500 mb-6 text-sm">Change access level for <span className="font-bold text-gray-900">{roleModalUser.full_name}</span>.</p>

            <div className="text-left mb-6">
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Select New Role</label>
              <select 
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none font-bold text-gray-700"
              >
                <option value="customer">Customer</option>
                <option value="superadmin">Super Admin</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="corporate_admin">Corporate Admin</option>
              </select>
            </div>

            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setRoleModalUser(null)}
                className="px-4 py-2 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors w-full"
              >
                Cancel
              </button>
              <button 
                onClick={handleRoleChange}
                className="px-4 py-2 rounded-xl font-bold text-white transition-colors shadow-sm w-full bg-black hover:bg-gray-800"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}