'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, Building2, Shield, TrendingUp, AlertCircle, RefreshCcw } from 'lucide-react';

interface AdminMetrics {
  total_active_households: number;
  total_corporate_partners: number;
  total_lifetime_contracts: number;
  unverified_manufacturers: number;
  avg_monthly_saved: number;
}

interface TrendData {
  period: string;
  savings: number;
  contracts: number;
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [metricsData, trendData] = await Promise.all([
        apiClient('/analytics/admin/metrics'),
        apiClient('/analytics/admin/trend')
      ]);
      setMetrics(metricsData);
      setTrend(trendData);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerSnapshot = async () => {
    try {
      setRefreshing(true);
      await apiClient('/scheduling/force-analytics', { method: 'POST' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to run snapshot');
      setRefreshing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500 animate-pulse">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">ANALYTICS</h1>
          <p className="text-slate-500 mt-2">Platform growth and real-time metrics</p>
        </div>
        <button 
          onClick={triggerSnapshot}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Force Snapshot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-orange-200 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Active Households</p>
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <h3 className="text-4xl font-black text-slate-900 relative z-10">
            {metrics?.total_active_households?.toLocaleString('en-IN') || '0'}
          </h3>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-blue-200 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Lifetime Contracts</p>
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-4xl font-black text-slate-900 relative z-10">
            {metrics?.total_lifetime_contracts?.toLocaleString('en-IN') || '0'}
          </h3>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-emerald-200 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Corporate Partners</p>
            <Building2 className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-4xl font-black text-slate-900 relative z-10">
            {metrics?.total_corporate_partners?.toLocaleString('en-IN') || '0'}
          </h3>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-indigo-200 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Avg Monthly Saved</p>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <h3 className="text-4xl font-black text-slate-900 relative z-10">
            ₹{metrics?.avg_monthly_saved?.toLocaleString('en-IN') || '0'}
          </h3>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Growth Trend (Contracts)</h2>
            <p className="text-sm text-slate-500">Historical lifetime contracts signed over the last snapshots</p>
          </div>
          <div className="h-80 w-full">
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorContracts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="contracts" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorContracts)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl">
                No historical snapshots available yet.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Savings Impact</h2>
            <p className="text-sm text-slate-500">Average household monthly savings impact over time</p>
          </div>
          <div className="h-80 w-full">
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`₹${value}`, 'Savings']}
                  />
                  <Area type="monotone" dataKey="savings" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl">
                No historical snapshots available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
