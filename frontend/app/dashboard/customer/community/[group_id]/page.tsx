'use client'

import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, MapPin, Loader2, ArrowLeft, Users, ShieldAlert, CheckCircle, Info } from 'lucide-react'

export default function GroupDetailsPage({ params }: { params: { group_id: string } }) {
  const router = useRouter()
  const [group, setGroup] = useState<any>(null)
  const [household, setHousehold] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [myGroups, setMyGroups] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      try {
        const hhData = await apiClient('/profiling/households/me').catch(() => null)
        setHousehold(hhData)

        const [groupData, myGroupsData] = await Promise.all([
          apiClient(`/community/groups/${params.group_id}`),
          apiClient('/community/me/groups').catch(() => [])
        ])
        setGroup(groupData)
        setMyGroups(Array.isArray(myGroupsData) ? myGroupsData : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.group_id])

  async function joinGroup() {
    setJoining(true)
    try {
      await apiClient(`/community/groups/${group.id}/join`, { method: 'POST' })
      const [groupData, myGroupsData] = await Promise.all([
        apiClient(`/community/groups/${params.group_id}`),
        apiClient('/community/me/groups').catch(() => [])
      ])
      setGroup(groupData)
      setMyGroups(Array.isArray(myGroupsData) ? myGroupsData : [])
    } catch (err: any) {
      alert(err.message)
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
  }

  if (!group) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Group Not Found</h2>
        <button onClick={() => router.push('/dashboard/customer/community')} className="text-accent underline">Go back</button>
      </div>
    )
  }

  const isAdmin = household?.id === group.admin_household_id
  const isMember = myGroups.some((g: any) => g.id === group.id)
  const pct = Math.min(100, Math.round((group.member_count / group.min_households_for_pooling) * 100))
  const needed = Math.max(0, group.min_households_for_pooling - group.member_count)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button 
        onClick={() => router.push('/dashboard/customer/community')}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Community
      </button>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-card border border-gray-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center shrink-0">
                <Building2 className="w-10 h-10 text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
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
                  {group.is_private && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-widest">
                      Private Pool
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter text-gray-900">
                  {group.name}
                </h1>
                <p className="text-gray-500 flex items-center gap-2 mt-2">
                  <MapPin className="w-4 h-4" />
                  {[group.locality, group.city, group.state, group.pincode].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" /> Group Progress
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between text-sm font-bold text-gray-900 mb-3">
                    <span>{group.member_count} / {group.min_households_for_pooling} Joined</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div className="bg-accent h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(3, pct)}%` }}></div>
                  </div>
                </div>

                {needed > 0 ? (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-800 text-sm">
                    <Info className="w-5 h-5 shrink-0" />
                    <p>This pool needs <strong>{needed} more households</strong> to join before wholesale discount tiers unlock for everyone.</p>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex gap-3 text-green-800 text-sm font-bold">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <p>Wholesale pooling is active! Members now get locked-in group pricing.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
               <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-gray-500" /> About Pool
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-500 font-medium text-sm">Target Size</span>
                  <span className="font-bold text-gray-900">{group.min_households_for_pooling} Households</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-500 font-medium text-sm">Visibility</span>
                  <span className="font-bold text-gray-900">{group.is_private ? 'Private (Invite Only)' : 'Public (Searchable)'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-500 font-medium text-sm">Current Status</span>
                  <span className="font-bold text-gray-900 capitalize">{group.status}</span>
                </div>
              </div>

              {isMember ? (
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <p className="text-green-600 font-bold flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5" /> You are a member
                  </p>
                  <p className="text-xs text-gray-500">Manage your membership from the Community dashboard.</p>
                </div>
              ) : (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={joinGroup}
                    disabled={joining}
                    className="w-full py-4 bg-accent text-white font-bold rounded-2xl shadow-button hover:shadow-button-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join this Pool'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
