'use client'

import { useAuth } from '@/lib/auth'
import { apiClient } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Users, Building2, Package, TrendingUp, Shield, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [forcingTask, setForcingTask] = useState<string | null>(null)

  const handleForceTask = async (endpoint: string, label: string, confirmMsg: string) => {
    if(!window.confirm(confirmMsg)) return;
    setForcingTask(endpoint)
    try {
      const res = await apiClient(endpoint, { method: 'POST' })
      toast.success(res.message || `Background task initiated: ${label}`)
    } catch (e: any) {
      toast.error(e.message || `Failed to start ${label}`)
    } finally {
      setForcingTask(null)
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [adminStats] = await Promise.all([
          apiClient('/analytics/admin/metrics').catch(() => null),
        ])
        setStats(adminStats)
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Active Households', value: stats?.total_active_households?.toLocaleString('en-IN') || '—', icon: <Users className="w-6 h-6" />, href: '/dashboard/admin/users' },
    { label: 'Corporate Partners', value: stats?.total_corporate_partners || '—', icon: <Building2 className="w-6 h-6" />, href: '/dashboard/admin/partners' },
    { label: 'Unverified Manufacturers', value: stats?.unverified_manufacturers || '0', icon: <Shield className="w-6 h-6 text-red-500" />, href: '/dashboard/admin/manufacturers' },
    { label: 'Lifetime Contracts', value: stats?.total_lifetime_contracts?.toLocaleString('en-IN') || '—', icon: <Shield className="w-6 h-6" />, href: '/dashboard/admin/analytics' },
  ]

  const quickLinks = [
    { label: 'Manufacturers', desc: 'Verify and onboard factory accounts', icon: <Building2 className="w-5 h-5" />, href: '/dashboard/admin/manufacturers' },
    { label: 'Routing Rules', desc: 'Configure product substitutes and age progression logic', icon: <TrendingUp className="w-5 h-5" />, href: '/dashboard/admin/routing' },
    { label: 'Legacy & Claims', desc: 'Process death certificates and contract transfers', icon: <Shield className="w-5 h-5" />, href: '/dashboard/admin/legacy' },
    { label: 'Manage Catalogue', desc: 'Create and update product categories', icon: <Package className="w-5 h-5" />, href: '/dashboard/admin/catalogue' },
    { label: 'Approve Partners', desc: 'Review and approve corporate partnership requests', icon: <Building2 className="w-5 h-5" />, href: '/dashboard/admin/partners' },
    { label: 'Manage Users', desc: 'View, activate, and deactivate user accounts', icon: <Users className="w-5 h-5" />, href: '/dashboard/admin/users' },
  ]

  const demoTasks = [
    { label: 'Generate Daily Deliveries', desc: 'Runs process_daily_deliveries to queue pending boxes', endpoint: '/scheduling/force-daily-deliveries', confirm: 'Generate new pending deliveries for today?' },
    { label: 'Auto-Substitution Engine', desc: 'Runs check_stock_availability to swap out-of-stock items', endpoint: '/scheduling/force-auto-substitute', confirm: 'Trigger the auto-substitution engine?' },
    { label: 'Deliveries & Billing', desc: 'Marks pending as delivered and generates invoices', endpoint: '/scheduling/force-deliveries', confirm: 'Instantly mark all pending deliveries as DELIVERED and generate invoices?' },
    { label: 'Process Due Payments', desc: 'Auto-charges Stripe for all pending draft invoices', endpoint: '/scheduling/force-payments', confirm: 'Process all pending payments via Stripe?' },
    { label: 'Enforce Grace Periods', desc: 'Suspends users whose invoices are past due', endpoint: '/scheduling/force-grace-periods', confirm: 'Enforce grace periods and suspend unpaid accounts?' },
    { label: 'Analytics Snapshot', desc: 'Runs weekly snapshot for the analytics dashboard', endpoint: '/scheduling/force-analytics', confirm: 'Generate new analytics snapshot?' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover
                       hover:-translate-y-1 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{stat.label}</span>
              <div className="text-accent/60 group-hover:text-accent transition-colors">{stat.icon}</div>
            </div>
            <div className="text-3xl font-display font-extrabold">{stat.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="group bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover
                       hover:-translate-y-1 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center
                              text-accent group-hover:bg-accent group-hover:text-white transition-all">
                {link.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold uppercase tracking-tight">{link.label}</h3>
                <p className="text-sm text-gray-500">{link.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-accent transition-colors" strokeWidth={2} />
            </div>
          </Link>
        ))}
      </div>

      {/* Demo Override Section */}
      <div className="mt-8 bg-amber-50 rounded-2xl p-6 border border-amber-200">
        <div className="mb-6">
          <h3 className="text-xl font-display font-bold text-amber-900 uppercase tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5" /> God Mode Triggers
          </h3>
          <p className="text-amber-800/80 text-sm mt-1">
            Instantly dispatch backend Celery background tasks. Use these triggers to advance the platform state during a live demo without waiting for cron schedules. 
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoTasks.map(task => (
            <div key={task.endpoint} className="bg-white/60 border border-amber-200/60 rounded-xl p-4 flex flex-col justify-between hover:bg-white transition-colors">
              <div className="mb-4">
                <h4 className="font-bold text-amber-900 text-sm">{task.label}</h4>
                <p className="text-xs text-amber-700/80 mt-1">{task.desc}</p>
              </div>
              <button 
                disabled={forcingTask !== null}
                onClick={() => handleForceTask(task.endpoint, task.label, task.confirm)}
                className="w-full text-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {forcingTask === task.endpoint ? 'Dispatching...' : 'Trigger Task'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}