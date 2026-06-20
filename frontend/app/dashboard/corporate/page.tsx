'use client'

import { useAuth } from '@/lib/auth'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Users, TrendingUp, Building2, Save, FileText, ArrowRight, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function CorporateDashboard() {
  const { user } = useAuth()
  const [partner, setPartner] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [p, emps] = await Promise.all([
          apiClient('/corporate/partners/me').catch(() => null),
          apiClient('/corporate/partners/me/employees').catch(() => []),
        ])
        setPartner(p)
        setEmployees(Array.isArray(emps) ? emps : [])
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">
          {partner?.company_name || 'Corporate Dashboard'}
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your employee subscriptions and payroll deductions
        </p>
      </div>

      {partner?.partnership_status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <h3 className="font-bold text-amber-900 uppercase tracking-tight text-sm">Account Pending Approval</h3>
            <p className="text-amber-800 text-sm mt-1">Your corporate account is currently under review by LifeKart administrators. You can configure your settings and enroll employees, but subsidies will not be activated until approved.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Employees Added</p>
          <p className="text-3xl font-display font-extrabold text-gray-900">{employees.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Active Enrollments</p>
          <p className="text-3xl font-display font-extrabold text-gray-900">{employees.filter(e => e.is_active).length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Account Status</p>
          <p className={`text-xl font-bold uppercase tracking-tight ${partner?.partnership_status === 'active' ? 'text-green-500' : 'text-accent'}`}>
            {partner?.partnership_status === 'pending' ? 'Pending Approval' : (partner?.partnership_status || 'Unknown')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/corporate/employees" className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all group flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold uppercase tracking-tight text-lg text-gray-900">Manage Employees</h3>
              <p className="text-sm text-gray-500">{employees.length} active enrollments</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-accent transition-colors" />
        </Link>
        
        <Link href="/dashboard/corporate/payroll" className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all group flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold uppercase tracking-tight text-lg text-gray-900">Payroll Hub</h3>
              <p className="text-sm text-gray-500">Generate deduction files</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-accent transition-colors" />
        </Link>
      </div>
    </div>
  )
}