'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { Gift, Plus, Loader2, Calendar, Package, ArrowRight, ShieldCheck, Heart } from 'lucide-react'

export default function GiftingPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await apiClient('/gifting/')
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">
              Gifting For Life
            </h1>
          </div>
          <p className="text-gray-500 max-w-xl">
            Secure a lifetime supply of essentials for your child or grandchild. Lock in today's prices and protect their future against inflation.
          </p>
        </div>
        <Link
          href="/dashboard/customer/gifting/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg
                     font-bold shadow-button hover:shadow-button-hover transition-all
                     hover:-translate-y-0.5 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Create a Lifetime Gift
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-card border border-gray-100">
          <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3 uppercase tracking-tight">No Gifts Created Yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Start building a legacy of care. Lock in wholesale prices on essentials for your loved ones from childhood through adulthood.
          </p>
          <Link
            href="/dashboard/customer/gifting/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg
                       font-bold shadow-button hover:shadow-button-hover transition-all"
          >
            Start a Gift Order <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/customer/gifting/${order.id}`}
              className="block bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-display font-bold uppercase tracking-tight group-hover:text-accent transition-colors">
                    {order.beneficiary_name}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">{order.beneficiary_relationship}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {order.payment_status === 'paid' ? 'ACTIVE' : 'PENDING'}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Coverage: Age {order.start_age} to {order.end_age}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span>{order.items?.length || 0} Products Locked</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>Protected against inflation</span>
                </div>
              </div>

              {(() => {
                const monthlyCost = order.items?.reduce((sum: number, item: any) => {
                  return sum + (item.locked_price * item.quantity_per_delivery * (30 / item.frequency_days))
                }, 0) || 0;

                return (
                  <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Total {order.end_age - order.start_age}-Year Contract Value</p>
                      <p className="font-display font-extrabold text-lg text-gray-500">
                        ₹{Number(order.total_value_locked || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs text-accent uppercase tracking-wider font-bold mb-0.5">Current Billing</p>
                      <p className="font-display font-extrabold text-2xl text-accent">
                        ₹{Math.round(monthlyCost).toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-500">/ mo</span>
                      </p>
                    </div>
                  </div>
                )
              })()}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
