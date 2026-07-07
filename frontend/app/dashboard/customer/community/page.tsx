'use client'

import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, MapPin, Plus, Loader2, CheckCircle, Search, Building2, Link2, MoreVertical, ShieldAlert, ArrowRight } from 'lucide-react'
import { CreateGroupModal } from '@/components/community/CreateGroupModal'

interface CommunityGroup {
  id: string
  name: string
  locality: string | null
  city: string | null
  state: string | null
  pincode: string | null
  admin_household_id: string
  min_households_for_pooling: number
  status: string
  is_private: boolean
  member_count: number
}

export default function CommunityPage() {
  const router = useRouter()
  const [nearbyGroups, setNearbyGroups] = useState<CommunityGroup[]>([])
  const [myGroups, setMyGroups] = useState<CommunityGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [household, setHousehold] = useState<any>(null)
  
  const [activeTab, setActiveTab] = useState<'nearby' | 'my_groups'>('nearby')
  const [searchPincode, setSearchPincode] = useState('')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{type: 'leave'|'delete', groupId: string} | null>(null)

  async function loadMyGroups() {
    try {
      const myGroupsData = await apiClient('/community/me/groups').catch(() => [])
      setMyGroups(Array.isArray(myGroupsData) ? myGroupsData : [])
    } catch {}
  }

  async function loadNearbyGroups(pincode: string) {
    try {
      const groupsData = await apiClient(`/community/groups?pincode=${pincode}`).catch(() => [])
      setNearbyGroups(Array.isArray(groupsData) ? groupsData : [])
    } catch {}
  }

  async function initialLoad() {
    setLoading(true)
    try {
      const hhData = await apiClient('/profiling/households/me').catch(() => null)
      setHousehold(hhData)
      const defaultPincode = hhData?.pincode || ''
      setSearchPincode(defaultPincode)
      
      await Promise.all([
        loadMyGroups(),
        loadNearbyGroups(defaultPincode)
      ])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { initialLoad() }, [])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await loadNearbyGroups(searchPincode)
    setLoading(false)
  }

  async function joinGroup(groupId: string) {
    setJoining(groupId)
    try {
      await apiClient(`/community/groups/${groupId}/join`, { method: 'POST' })
      await Promise.all([loadMyGroups(), loadNearbyGroups(searchPincode)])
    } catch (err: any) {
      alert(err.message)
    } finally {
      setJoining(null)
    }
  }

  async function handleConfirmAction() {
    if (!confirmModal) return
    const { type, groupId } = confirmModal
    setLoading(true)
    try {
      if (type === 'leave') {
        await apiClient(`/community/groups/${groupId}/leave`, { method: 'DELETE' })
      } else {
        await apiClient(`/community/groups/${groupId}`, { method: 'DELETE' })
      }
      await Promise.all([loadMyGroups(), loadNearbyGroups(searchPincode)])
    } catch (e: any) { 
      alert(e.message) 
    }
    setMenuOpen(null)
    setConfirmModal(null)
    setLoading(false)
  }

  function copyInviteLink(groupId: string) {
    const url = `${window.location.origin}/dashboard/customer/community/${groupId}`
    navigator.clipboard.writeText(url)
    setCopiedLink(groupId)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  if (loading && !household) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64" />
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">Community Groups</h1>
          <p className="text-gray-500 mt-1">Pool orders with neighbors for massive wholesale discounts.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-accent rounded-xl
                     shadow-button hover:shadow-button-hover hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div>

      <div className="flex items-center gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('nearby')}
          className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${
            activeTab === 'nearby' ? 'text-accent' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Discover Nearby
          {activeTab === 'nearby' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('my_groups')}
          className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${
            activeTab === 'my_groups' ? 'text-accent' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          My Groups ({myGroups.length})
          {activeTab === 'my_groups' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === 'nearby' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter pincode to discover other neighborhoods..."
                  value={searchPincode}
                  onChange={e => setSearchPincode(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:border-accent focus:bg-white rounded-xl outline-none transition-all"
                />
              </div>
              <button type="submit" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
                Search
              </button>
            </form>
          </div>

          {loading ? (
             <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
          ) : nearbyGroups.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 shadow-card text-center">
              <MapPin className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-900 font-bold text-lg">No groups found in {searchPincode}</p>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">Be the first to start a wholesale pool in this area and invite your neighbors!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {nearbyGroups.map((group) => {
                const isMember = myGroups.some(g => g.id === group.id)
                const pct = Math.min(100, Math.round((group.member_count / group.min_households_for_pooling) * 100))
                const needed = Math.max(0, group.min_households_for_pooling - group.member_count)
                
                return (
                  <div key={group.id} className="bg-white rounded-2xl p-6 shadow-card border border-gray-50 flex flex-col justify-between hover:border-accent/20 transition-colors">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-accent" />
                        </div>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-widest">
                          {group.min_households_for_pooling} Households Tier
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{group.name}</h3>
                      <p className="text-sm text-gray-500 capitalize flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {[group.locality, group.city, group.pincode].filter(Boolean).join(', ')}
                      </p>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between text-sm font-bold text-gray-900 mb-2">
                        <span>{group.member_count} / {group.min_households_for_pooling} Joined</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden shadow-inner">
                        <div className="bg-accent h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(3, pct)}%` }}></div>
                      </div>
                      {needed > 0 && <p className="text-xs text-gray-500">{needed} more needed to unlock wholesale tier</p>}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                      {isMember ? (
                        <div className="flex items-center justify-center gap-2 w-full py-3 bg-green-50 text-green-700 font-bold rounded-xl">
                          <CheckCircle className="w-5 h-5" /> You joined this pool
                        </div>
                      ) : (
                        <button
                          onClick={() => joinGroup(group.id)}
                          disabled={joining === group.id}
                          className="flex items-center justify-center gap-2 w-full py-3 text-white bg-accent font-bold rounded-xl shadow-button hover:shadow-button-hover transition-all disabled:opacity-50"
                        >
                          {joining === group.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Pool'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'my_groups' && (
        <div className="space-y-6">
          {myGroups.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 shadow-card text-center">
              <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-900 font-bold text-lg">You haven't joined any pools yet</p>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">Switch to the Discover tab to find pools in your neighborhood, or create your own!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {myGroups.map((group) => {
                const isAdmin = household?.id === group.admin_household_id
                const pct = Math.min(100, Math.round((group.member_count / group.min_households_for_pooling) * 100))
                
                return (
                  <div key={group.id} className="bg-white rounded-2xl shadow-card border border-gray-100 flex flex-col justify-between overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex items-center gap-2 relative">
                          {isAdmin && (
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Admin
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                            group.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {group.status}
                          </span>
                          <button onClick={() => setMenuOpen(menuOpen === group.id ? null : group.id)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                          </button>
                          
                          {menuOpen === group.id && (
                            <div className="absolute top-8 right-0 bg-white border border-gray-100 shadow-xl rounded-xl w-48 py-1 z-10">
                              {isAdmin ? (
                                <>
                                  <button onClick={() => setConfirmModal({type: 'leave', groupId: group.id})} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors border-b border-gray-100">
                                    Leave (Transfer Admin)
                                  </button>
                                  <button onClick={() => setConfirmModal({type: 'delete', groupId: group.id})} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors">
                                    Delete Pool
                                  </button>
                                </>
                              ) : (
                                <button onClick={() => setConfirmModal({type: 'leave', groupId: group.id})} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors">
                                  Leave Pool
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{group.name}</h3>
                      <p className="text-sm text-gray-500 capitalize flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {[group.locality, group.pincode].filter(Boolean).join(', ')}
                      </p>
                      
                      <div className="mt-6">
                        <div className="flex items-center justify-between text-sm font-bold text-gray-900 mb-2">
                          <span>{group.member_count} / {group.min_households_for_pooling} Joined</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden shadow-inner">
                          <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(3, pct)}%` }}></div>
                        </div>
                        {group.member_count < group.min_households_for_pooling && (
                          <p className="text-xs text-gray-500">{group.min_households_for_pooling - group.member_count} more needed</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 border-t border-gray-100 p-4 flex gap-3">
                      <button
                        onClick={() => copyInviteLink(group.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm shadow-sm"
                      >
                        {copiedLink === group.id ? (
                          <><CheckCircle className="w-4 h-4 text-green-500" /> Copied!</>
                        ) : (
                          <><Link2 className="w-4 h-4" /> Share Invite Link</>
                        )}
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/customer/community/${group.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent text-white font-bold rounded-xl hover:shadow-button-hover transition-all text-sm shadow-sm"
                      >
                        View Group <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {showCreate && household && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false)
            initialLoad()
          }}
          initialPincode={household.pincode || ''}
          initialCity={household.city || ''}
          initialState={household.state || ''}
        />
      )}

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {confirmModal.type === 'leave' ? 'Leave Pool' : 'Delete Pool'}
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              {confirmModal.type === 'leave' 
                ? 'Are you sure you want to leave this pool? If you are the admin, your admin rights will be transferred to the oldest member.'
                : 'Are you sure you want to permanently delete this pool? This action cannot be undone and will kick all members.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 px-4 font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleConfirmAction} className={`flex-1 py-3 px-4 text-white font-bold rounded-xl transition-all ${confirmModal.type === 'leave' ? 'bg-accent shadow-button hover:shadow-button-hover' : 'bg-red-600 hover:bg-red-700 shadow-sm'}`}>
                {confirmModal.type === 'leave' ? 'Yes, Leave' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}