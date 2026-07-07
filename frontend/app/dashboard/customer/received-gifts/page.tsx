'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { Package, Gift, Calendar, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ReceivedGiftsPage() {
  const [gifts, setGifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await apiClient('/gifting/received')
        setGifts(data)
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
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-extrabold tracking-tight">Received Gifts</h1>
        <p className="text-gray-500 mt-1">Gifts you have claimed from benefactors.</p>
      </div>

      {gifts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Gifts Yet</h2>
          <p className="text-gray-500">You haven't claimed any gifts yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gifts.map(gift => (
            <div key={gift.id} className="bg-white rounded-2xl shadow-card p-6 border-l-4 border-l-accent flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                      <Gift className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">For {gift.beneficiary_name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Ages {gift.start_age} to {gift.end_age}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold uppercase">
                    Active
                  </span>
                </div>
                
                <div className="bg-surface-muted rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">Items Included</p>
                  <ul className="space-y-2">
                    {gift.items?.map((item: any) => (
                      <li key={item.id} className="flex justify-between items-center text-sm">
                        <span className="font-bold text-gray-900">{item.product?.name || 'Product'}</span>
                        <span className="text-gray-500">{item.quantity_per_delivery} every {item.frequency_days}d</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <Link 
                href="/dashboard/customer/deliveries"
                className="flex items-center justify-center gap-2 w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors mt-auto"
              >
                <Package className="w-4 h-4" />
                Track Deliveries
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
