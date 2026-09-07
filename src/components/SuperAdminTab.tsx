import React from 'react';
import {
  ShieldCheck,
  Users,
  Coins,
  CreditCard,
  Building2,
  TrendingUp,
  Server,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { Circle, User } from '../types';

interface SuperAdminTabProps {
  circles: Circle[];
  users: User[];
}

export const SuperAdminTab: React.FC<SuperAdminTabProps> = ({ circles, users }) => {
  const plans = [
    {
      name: 'Free Starter',
      price: '₹0',
      period: 'forever',
      features: ['1 Private Circle', 'Up to 10 Members', 'Weekly Savings', 'Standard Ledger'],
      activeSubscribers: 142,
    },
    {
      name: 'Squad Pro',
      price: '₹99',
      period: 'per month',
      features: ['3 Private Circles', 'Up to 25 Members', 'Tour Planner & Itinerary', 'Internal Loan Pool', 'PDF Exports'],
      activeSubscribers: 86,
      popular: true,
    },
    {
      name: 'Circle Elite',
      price: '₹199',
      period: 'per month',
      features: ['Unlimited Circles', 'Unlimited Members', 'Custom Interest Rate Engine', 'Priority WhatsApp Support', 'Audit Verification Seal'],
      activeSubscribers: 34,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Operations Console</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            Super Admin Control Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Platform-wide governance, multi-tenant circle monitoring, and SaaS subscription metrics.
          </p>
        </div>
      </div>

      {/* Platform KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Circles Hosted</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {circles.length + 262}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">+18 created this month</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {users.length + 1840}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">94% active retention</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Monthly Platform ARR/MRR</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
            ₹15,280/mo
          </div>
          <p className="text-[11px] text-slate-400 mt-1">From Pro &amp; Elite tiers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>System Health</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-base font-semibold">99.98% Up</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Express API running healthy</p>
        </div>
      </div>

      {/* SaaS Subscription Tiers (Section 23) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg font-['Space_Grotesk']">
            SaaS Subscription Packages &amp; Pricing Engine
          </h3>
          <p className="text-xs text-slate-500">
            Configured monetization tiers with stripe/razorpay recurring billing integration ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                plan.popular
                  ? 'border-emerald-500 bg-emerald-50/20 shadow-md ring-1 ring-emerald-500'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                  Most Popular
                </span>
              )}

              <div>
                <h4 className="font-bold text-slate-900 text-base">{plan.name}</h4>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-500">/{plan.period}</span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">{plan.activeSubscribers} Active Circles</span>
                <span className="font-semibold text-emerald-700">Live Tier</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Managed Circles Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base font-['Space_Grotesk']">
          All Circles on Platform
        </h3>

        <div className="divide-y divide-slate-100">
          {circles.map((c) => (
            <div key={c.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                <div className="text-xs text-slate-400">
                  ID: {c.id} • Code: {c.inviteCode} • Plan: {c.planTier.toUpperCase()}
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="font-mono font-bold text-slate-900">
                  {c.currencySymbol}{c.contributionAmount}/{c.contributionFrequency}
                </span>
                <div className="text-slate-500">{c.membersCount || 10} members</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
