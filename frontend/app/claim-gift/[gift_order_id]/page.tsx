'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sparkles, Gift, MapPin, CheckCircle, Package, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { apiClient } from '@/lib/api'

export default function ClaimGiftPage() {
  const params = useParams()
  const [gift, setGift] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [fatalError, setFatalError] = useState('')
  const [formError, setFormError] = useState('')
  const { user, register, login, accessToken, isLoading: authLoading } = useAuth()
  
  const [stage, setStage] = useState<'reveal' | 'auth' | 'address' | 'success'>('reveal')
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [authForm, setAuthForm] = useState({ full_name: '', email: '', password: '' })
  const [authSubmitting, setAuthSubmitting] = useState(false)
  
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/gifting/public/${params.gift_order_id}`)
        if (!res.ok) {
          throw new Error('Gift not found or invalid link.')
        }
        const data = await res.json()
        setGift(data)
        if (data.claimed) {
          setStage('success')
        }
      } catch (err: any) {
        setFatalError(err.message || 'Failed to load gift details')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.gift_order_id])

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAuthSubmitting(true)
    setFormError('')
    try {
      if (authMode === 'register') {
        await register({ ...authForm, role: 'customer' }, false)
      } else {
        await login(authForm.email, authForm.password, false)
      }
      setStage('address')
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setAuthSubmitting(false)
    }
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault()
    setClaiming(true)
    setFormError('')
    
    try {
      await apiClient(`/gifting/${params.gift_order_id}/claim`, {
        method: 'POST',
        body: JSON.stringify({ address })
      })
      
      setStage('success')
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setClaiming(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </div>
    )
  }

  if (fatalError || !gift) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-card text-center">
          <p className="text-red-500 font-bold mb-2">Error</p>
          <p className="text-gray-600 mb-6">{fatalError}</p>
          <Link href="/" className="text-accent font-bold hover:underline">Go to Homepage</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      
      {/* Brand Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-display font-extrabold tracking-tighter text-accent flex items-center justify-center gap-2">
          <Package className="w-8 h-8" />
          LIFEKART
        </h1>
        <p className="text-gray-500 font-medium text-sm tracking-widest uppercase mt-2">Lifetime Wholesale</p>
      </div>

      <div className="max-w-xl w-full">
        {stage === 'reveal' && (
          <div className="bg-white rounded-3xl shadow-card overflow-hidden">
            <div className="bg-accent p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_100%)]"></div>
              <Gift className="w-24 h-24 text-white mx-auto mb-6 relative z-10 animate-bounce" />
              <h2 className="text-4xl font-display font-extrabold text-white uppercase tracking-tight relative z-10">
                You've received a Gift for Life!
              </h2>
            </div>
            
            <div className="p-8 md:p-12 text-center">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Someone has secured a <strong className="text-accent">{gift.end_age - gift.start_age}-year supply</strong> of wholesale essentials for <strong className="text-gray-900">{gift.beneficiary_name}</strong>.
              </p>
              
              <div className="bg-surface-muted rounded-2xl p-6 mb-8 text-left">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Included in this gift:</p>
                <ul className="space-y-4">
                  {gift.items.map((item: any, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Package className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">{item.product_name}</p>
                        <p className="text-xs text-gray-500">Every {item.frequency_days} days</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => user ? setStage('address') : setStage('auth')}
                className="w-full flex items-center justify-center gap-2 px-8 py-5 bg-accent text-white font-bold rounded-2xl shadow-button hover:shadow-button-hover transition-all text-xl uppercase tracking-wider"
              >
                <Sparkles className="w-6 h-6" />
                Unwrap & Accept Gift
              </button>
            </div>
          </div>
        )}

        {stage === 'auth' && (
          <div className="bg-white rounded-3xl shadow-card p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold uppercase tracking-tight">Create your account</h2>
              <p className="text-sm text-gray-500 mt-2">Create a free account to track your incoming deliveries.</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              {formError && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
                  {formError}
                </div>
              )}

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.full_name}
                    onChange={e => setAuthForm({...authForm, full_name: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-muted rounded-xl border-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={e => setAuthForm({...authForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-muted rounded-xl border-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={authForm.password}
                  onChange={e => setAuthForm({...authForm, password: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-muted rounded-xl border-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl shadow-button hover:shadow-button-hover transition-all disabled:opacity-50 text-lg uppercase tracking-wider"
              >
                {authSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  authMode === 'register' ? 'Create Account & Continue' : 'Sign In & Continue'
                )}
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                  className="text-sm font-bold text-gray-500 hover:text-accent"
                >
                  {authMode === 'register' ? 'Already have an account? Sign in' : 'Need an account? Register'}
                </button>
              </div>
            </form>
          </div>
        )}

        {stage === 'address' && (
          <div className="bg-white rounded-3xl shadow-card p-8 md:p-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold uppercase tracking-tight">Where should we send it?</h2>
                <p className="text-sm text-gray-500">Enter your delivery address for {gift.beneficiary_name}'s supplies.</p>
              </div>
            </div>

            <form onSubmit={handleClaim} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={100}
                  value={address.line1}
                  onChange={e => setAddress({...address, line1: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-muted rounded-xl border-none focus:ring-2 focus:ring-accent"
                  placeholder="House No, Building, Street"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Address Line 2</label>
                <input
                  type="text"
                  maxLength={100}
                  value={address.line2}
                  onChange={e => setAddress({...address, line2: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-muted rounded-xl border-none focus:ring-2 focus:ring-accent"
                  placeholder="Area, Landmark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">City *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={50}
                    value={address.city}
                    onChange={e => setAddress({...address, city: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-muted rounded-xl border-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">State *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={50}
                    value={address.state}
                    onChange={e => setAddress({...address, state: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-muted rounded-xl border-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pincode *</label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  value={address.pincode}
                  onChange={e => setAddress({...address, pincode: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-muted rounded-xl border-none focus:ring-2 focus:ring-accent"
                  placeholder="6-digit pincode"
                />
              </div>
              
              {formError && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={claiming}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-black text-white font-bold rounded-xl shadow-button hover:bg-gray-900 transition-all disabled:opacity-50 text-lg uppercase tracking-wider mt-4"
              >
                {claiming ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Delivery Details'}
              </button>
            </form>
          </div>
        )}

        {stage === 'success' && (
          <div className="bg-white rounded-3xl shadow-card p-12 text-center">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-display font-extrabold uppercase tracking-tight text-gray-900 mb-4">
              Gift Claimed!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              The delivery address has been securely routed. The essentials will automatically begin arriving according to the schedule. 
            </p>
            <div className="bg-surface-muted p-6 rounded-2xl border border-gray-100">
              <p className="text-sm font-bold text-gray-900">Want to track your deliveries?</p>
              <p className="text-sm text-gray-500 mt-2 mb-4">View your incoming supplies directly on your personal dashboard.</p>
              <Link href="/dashboard/customer" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm shadow-sm hover:border-accent hover:text-accent transition-colors">
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
