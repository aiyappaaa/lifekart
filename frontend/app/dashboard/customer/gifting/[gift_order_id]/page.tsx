'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Loader2, ShieldCheck, Heart, Package, CheckCircle, CreditCard, Calendar, Copy, Check } from 'lucide-react'
import StripePaymentForm from '@/components/StripePaymentForm'

export default function GiftOrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [gift, setGift] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activating, setActivating] = useState(false)
  const [showStripe, setShowStripe] = useState(false)
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [giftData, methods] = await Promise.all([
          apiClient(`/gifting/${params.gift_order_id}`),
          apiClient('/payments/methods').catch(() => [])
        ])
        setGift(giftData)
        setHasPaymentMethod(methods && methods.length > 0)
      } catch (err: any) {
        setError(err.message || 'Gift order not found')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.gift_order_id])

  async function handleActivate() {
    setActivating(true)
    setError('')
    try {
      await apiClient(`/gifting/${params.gift_order_id}/activate`, { method: 'POST' })
      const updated = await apiClient(`/gifting/${params.gift_order_id}`)
      setGift(updated)
      setShowStripe(false)
    } catch (err: any) {
      setError(err.message || 'Failed to activate gift')
    } finally {
      setActivating(false)
    }
  }

  function handleCopyLink() {
    const link = `${window.location.origin}/claim-gift/${gift.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    )
  }

  if (error || !gift) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-4">Error</h2>
        <p className="text-gray-500 mb-8">{error}</p>
        <Link href="/dashboard/customer/gifting" className="text-accent font-bold hover:underline">
          Return to Gifting
        </Link>
      </div>
    )
  }

  const isPaid = gift.payment_status === 'paid'

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link
        href="/dashboard/customer/gifting"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-accent transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Gifting
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-badge">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">
                {gift.beneficiary_name}
              </h1>
              <p className="text-gray-500 font-medium capitalize">{gift.beneficiary_relationship}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className={`px-4 py-2 rounded-xl text-center border-2 ${isPaid ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            <p className="text-xs font-bold uppercase tracking-wider mb-0.5">Status</p>
            <p className="font-display font-bold leading-none">{isPaid ? 'Active & Protected' : 'Pending Activation'}</p>
          </div>
          
          {isPaid && (
            <button 
              onClick={handleCopyLink}
              className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-bold shadow-sm transition-colors ${
                copied 
                  ? 'bg-green-600 border-green-600 text-white' 
                  : 'bg-white border-gray-200 hover:border-accent hover:text-accent text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Link Copied!' : 'Copy Gift Link'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-card border border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Duration</p>
          <p className="text-2xl font-display font-extrabold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            {gift.end_age - gift.start_age} Years
          </p>
          <p className="text-xs text-gray-500 mt-1">From age {gift.start_age} to {gift.end_age}</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-card border border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Items Locked</p>
          <p className="text-2xl font-display font-extrabold flex items-center gap-2">
            <Package className="w-5 h-5 text-accent" />
            {gift.items?.length || 0} Products
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-card border border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Total {gift.end_age - gift.start_age}-Year Value</p>
          <p className="text-2xl font-display font-extrabold text-gray-500">
            ₹{Number(gift.total_value_locked || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">Legally locked</p>
        </div>

        {(() => {
          const monthlyCost = gift.items?.reduce((sum: number, item: any) => {
            return sum + (item.locked_price * item.quantity_per_delivery * (30 / item.frequency_days))
          }, 0) || 0;
          return (
            <div className="bg-black text-white p-5 rounded-2xl shadow-card">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Current Billing</p>
              <p className="text-2xl font-display font-extrabold text-accent">
                ₹{Math.round(monthlyCost).toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-400">/ mo</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Billed per delivery</p>
            </div>
          )
        })()}
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-card">
        <h3 className="text-xl font-display font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-accent" />
          Included Essentials
        </h3>
        
        <div className="space-y-4">
          {gift.items?.map((item: any) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-muted rounded-xl gap-4">
              <div>
                <p className="font-bold">{item.product?.name || `Product ID: ${item.product_id.slice(0,8)}`}</p>
                <p className="text-sm text-gray-500">
                  Deliver {item.quantity_per_delivery} unit(s) every {item.frequency_days} days
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Locked Price</p>
                <p className="font-display font-bold text-lg text-accent">₹{Number(item.locked_price).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isPaid && (
        <div className="bg-white rounded-2xl p-6 shadow-card border-2 border-accent">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-accent" />
            <h3 className="text-xl font-display font-bold uppercase tracking-tight">Activate Lifetime Gift</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            To secure these prices against inflation for the next {gift.end_age - gift.start_age} years, please activate your contract. You will only be billed per delivery.
          </p>

          {showStripe ? (
            <StripePaymentForm 
              onSuccess={() => {
                setHasPaymentMethod(true)
                handleActivate()
              }} 
              buttonText="Save Card & Activate Gift" 
            />
          ) : (
            <button
              onClick={() => hasPaymentMethod ? handleActivate() : setShowStripe(true)}
              disabled={activating}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl
                         shadow-button hover:shadow-button-hover transition-all disabled:opacity-50 text-lg"
            >
              {activating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
              {activating ? 'Activating...' : (hasPaymentMethod ? 'Activate Gift Now' : 'Proceed to Secure Billing')}
            </button>
          )}
        </div>
      )}

      {isPaid && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center flex flex-col items-center">
          <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
          <h3 className="text-2xl font-display font-extrabold uppercase tracking-tight text-green-800 mb-2">
            Gift Successfully Activated
          </h3>
          <p className="text-green-700 max-w-md">
            The lifetime supply has been legally locked in. Prices are secured against inflation until age {gift.end_age}.
          </p>
        </div>
      )}
    </div>
  )
}
