import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Database,
  PlusCircle,
  Camera,
  Upload,
  UserCheck,
} from 'lucide-react';
import { Circle, User, CircleMember } from '../../types';
import { SUPABASE_URL, isSupabaseConnected, saveAnonKey, getAnonKey } from '../../lib/supabase';
import { Logo } from '../Logo';

interface AuthPageProps {
  circles: Circle[];
  members: CircleMember[];
  onLoginAsAdmin: (circleId: string, adminUser: User) => void;
  onLoginAsMember: (circleId: string, memberUser: User) => void;
  onCreateCircleAndLogin?: (circleData: {
    name: string;
    description: string;
    contributionAmount: number;
    contributionFrequency: 'weekly' | 'monthly';
    contributionDay: string;
    adminSecretCode: string;
    adminName?: string;
    adminPhotoUrl?: string;
  }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  circles,
  members,
  onLoginAsAdmin,
  onLoginAsMember,
  onCreateCircleAndLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'member'>('admin');
  const [adminMode, setAdminMode] = useState<'signin' | 'create'>(
    circles.length > 0 ? 'signin' : 'create'
  );

  // Admin Login State
  const [selectedCircleId, setSelectedCircleId] = useState<string>(
    circles[0]?.id || ''
  );
  const [adminSecretCode, setAdminSecretCode] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  // New Circle & Admin Creation State
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDescription, setNewCircleDescription] = useState('');
  const [newCircleAmount, setNewCircleAmount] = useState(500);
  const [newCircleFrequency, setNewCircleFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPhotoUrl, setNewAdminPhotoUrl] = useState('');
  const [newCircleSecretCode, setNewCircleSecretCode] = useState('');
  const [showCreateSecret, setShowCreateSecret] = useState(false);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Member Login State
  const [memberPhone, setMemberPhone] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [showMemberPassword, setShowMemberPassword] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  // Supabase Key Modal
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputAnonKey, setInputAnonKey] = useState(getAnonKey());
  const [keySavedMessage, setKeySavedMessage] = useState<string | null>(null);

  const handleAdminPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewAdminPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCircleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newCircleName.trim()) {
      setCreateError('Please enter a circle name.');
      return;
    }

    if (!newCircleSecretCode.trim()) {
      setCreateError('Please enter the Admin Secret Code to verify your administrator identity.');
      return;
    }

    // Security Check: Only the Circle Admin who knows the default secret code (ADMIN2026) can create circles
    const authorizedCodes = ['ADMIN2026', ...circles.map((c) => c.adminSecretCode).filter(Boolean)];
    const isAuthorized = authorizedCodes.some(
      (code) => code && code.trim().toLowerCase() === newCircleSecretCode.trim().toLowerCase()
    );

    if (!isAuthorized) {
      setCreateError('Access Denied: Invalid Admin Secret Code. Only authorized Circle Admins know this code to create a circle.');
      return;
    }

    if (onCreateCircleAndLogin) {
      onCreateCircleAndLogin({
        name: newCircleName.trim(),
        description: newCircleDescription.trim(),
        contributionAmount: Number(newCircleAmount),
        contributionFrequency: newCircleFrequency,
        contributionDay: 'Sunday',
        adminSecretCode: newCircleSecretCode.trim(),
        adminName: newAdminName.trim() || undefined,
        adminPhotoUrl: newAdminPhotoUrl || undefined,
      });
    }
  };

  // Admin Sign-in handler
  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const circle = circles.find((c) => c.id === selectedCircleId) || circles[0];
    if (!circle) {
      setAdminError('No circle found. Please contact support.');
      return;
    }

    const expectedSecret = circle.adminSecretCode || 'ADMIN2026';
    if (adminSecretCode.trim() !== expectedSecret.trim()) {
      setAdminError('Invalid Secret Code. Please enter the correct admin secret code.');
      return;
    }

    // Authenticate as Circle Admin (restore circle admin's custom profile if existing)
    const existingAdminMember = members.find((m) => m.circleId === circle.id && m.role === 'circle_admin');
    const adminName = existingAdminMember?.name || circle.adminName || 'Circle Admin';
    const adminPhoto =
      existingAdminMember?.avatarUrl ||
      circle.adminPhotoUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const adminUser: User = {
      id: `admin-${circle.id}`,
      name: adminName,
      email: 'admin@buddyfund.local',
      phone: '+91 98401 00000',
      avatarUrl: adminPhoto,
      role: 'circle_admin',
      joinedDate: new Date().toISOString().split('T')[0],
      circleIds: [circle.id],
      isVerified: true,
      status: 'active',
    };

    onLoginAsAdmin(circle.id, adminUser);
  };

  // Member Sign-in handler
  const handleMemberSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError(null);

    if (!memberPhone.trim()) {
      setMemberError('Please enter your registered phone number.');
      return;
    }

    // Clean phone formatting for matching
    const cleanPhone = memberPhone.replace(/\D/g, '');

    // Search among circle members
    const matchedMember = members.find((m) => {
      const storedCleanPhone = (m.phone || '').replace(/\D/g, '');
      const phoneMatches = storedCleanPhone.includes(cleanPhone) || cleanPhone.includes(storedCleanPhone);
      return phoneMatches;
    });

    if (!matchedMember) {
      setMemberError(
        'Phone number not found in this circle. Please ask your Circle Admin to add you in Squad Members.'
      );
      return;
    }

    if (matchedMember.password && matchedMember.password.trim() !== memberPassword.trim()) {
      setMemberError('Incorrect password. Please verify your credentials.');
      return;
    }

    // Authenticate as Squad Member
    const memberUser: User = {
      id: matchedMember.userId || matchedMember.id,
      name: matchedMember.name,
      email: matchedMember.email || `${matchedMember.name.toLowerCase().replace(/\s+/g, '')}@buddyfund.local`,
      phone: matchedMember.phone,
      avatarUrl: matchedMember.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchedMember.name}`,
      role: 'member',
      joinedDate: matchedMember.joinedDate || new Date().toISOString().split('T')[0],
      circleIds: [matchedMember.circleId],
      isVerified: true,
      status: 'active',
    };

    onLoginAsMember(matchedMember.circleId, memberUser);
  };

  const handleSaveAnonKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveAnonKey(inputAnonKey);
    setKeySavedMessage('Supabase Anon Key saved successfully! Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const isConnected = isSupabaseConnected();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Brand */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between z-10">
        <Logo dark size="md" subtitle="Transparent Peer Savings & Squad Ledger" />

        {/* Database Status Pill */}
        <button
          onClick={() => setShowKeyModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-300 transition shadow-xs"
          title="Supabase Database Connection Settings"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span className="hidden sm:inline font-mono text-[11px]">
            {isConnected ? 'Supabase Connected' : 'Supabase (Local Active)'}
          </span>
          <Database className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          {/* Header Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Secure Circle Portal</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight font-cute" style={{ fontFamily: "'Comfortaa', 'Fredoka', 'Quicksand', cursive, sans-serif" }}>
              Welcome to Ithanu_njangal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose your role to enter the transparent squad ledger
            </p>
          </div>

          {/* Tab Selector - Admin & Member Only */}
          <div className="grid grid-cols-2 gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 mb-6">
            <button
              onClick={() => {
                setActiveTab('admin');
                setAdminError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('member');
                setMemberError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'member'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Member</span>
            </button>
          </div>

          {/* TAB 1: CIRCLE ADMIN (Sign In or Create New Circle) */}
          {activeTab === 'admin' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Admin Mode Switcher */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAdminMode('signin');
                    setAdminError(null);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    adminMode === 'signin'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminMode('create');
                    setCreateError(null);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    adminMode === 'create'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-xs'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create New Circle</span>
                </button>
              </div>

              {adminMode === 'signin' ? (
                /* Sub-form 1: Sign In Existing Circle as Admin */
                circles.length === 0 ? (
                  <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 text-center space-y-2.5">
                    <p className="text-xs text-slate-200 font-bold">No circles created yet.</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Click <strong className="text-emerald-400">"Create New Circle"</strong> above to launch your squad's first circle and ledger!
                    </p>
                    <button
                      type="button"
                      onClick={() => setAdminMode('create')}
                      className="mt-1 py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-sm"
                    >
                      + Create First Circle
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAdminSignIn} className="space-y-4 text-xs sm:text-sm">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1 text-xs">Select Circle</label>
                      <select
                        value={selectedCircleId}
                        onChange={(e) => setSelectedCircleId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-medium"
                      >
                        {circles.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.currencySymbol}
                            {c.contributionAmount}/{c.contributionFrequency})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-300 font-medium text-xs">Admin Secret Code</label>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          placeholder="Enter Secret Code"
                          value={adminSecretCode}
                          onChange={(e) => setAdminSecretCode(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
                          required
                        />
                      </div>
                    </div>

                    {adminError && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                        <span>{adminError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-2xl font-extrabold shadow-[0_6px_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Enter as Circle Admin</span>
                    </button>
                  </form>
                )
              ) : (
                /* Sub-form 2: Create New Circle & Admin Profile */
                <form onSubmit={handleCreateCircleSubmit} className="space-y-3.5 text-xs sm:text-sm animate-in fade-in duration-200">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1 text-xs">Circle Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Palakkad Gang, Startup Squad 2026"
                      value={newCircleName}
                      onChange={(e) => setNewCircleName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1 text-xs">Purpose / Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Goa Tour Fund & Monthly peer savings"
                      value={newCircleDescription}
                      onChange={(e) => setNewCircleDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1 text-xs">Amount per Member (₹)</label>
                      <input
                        type="number"
                        min="50"
                        step="50"
                        value={newCircleAmount}
                        onChange={(e) => setNewCircleAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1 text-xs">Frequency</label>
                      <select
                        value={newCircleFrequency}
                        onChange={(e) => setNewCircleFrequency(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  {/* Circle Admin Profile (Name & Custom Photo Only) */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-bold text-slate-200">Admin Identity</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">Your Profile</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative group flex-shrink-0">
                        <img
                          src={
                            newAdminPhotoUrl ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                          }
                          alt="Admin Avatar"
                          className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-500 shadow-sm"
                        />
                        <label
                          htmlFor="auth-admin-photo-upload"
                          className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full flex items-center justify-center cursor-pointer shadow-md transition"
                          title="Upload custom photo"
                        >
                          <Camera className="w-2.5 h-2.5" />
                        </label>
                        <input
                          id="auth-admin-photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAdminPhotoUpload}
                          className="hidden"
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <label className="block text-[11px] font-medium text-slate-300">Admin Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Karthik, Squad Leader"
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                      <span>Admin Photo Option:</span>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="auth-admin-photo-upload-btn"
                          className="text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1 font-medium"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload Photo</span>
                        </label>
                        <input
                          id="auth-admin-photo-upload-btn"
                          type="file"
                          accept="image/*"
                          onChange={handleAdminPhotoUpload}
                          className="hidden"
                        />
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                          className="text-slate-400 hover:text-white transition font-medium"
                        >
                          {showCustomUrlInput ? 'Hide URL' : 'Image URL'}
                        </button>
                      </div>
                    </div>

                    {showCustomUrlInput && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="url"
                          placeholder="Paste image URL..."
                          value={customPhotoInput}
                          onChange={(e) => setCustomPhotoInput(e.target.value)}
                          className="flex-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white text-[11px] placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customPhotoInput.trim()) {
                              setNewAdminPhotoUrl(customPhotoInput.trim());
                              setShowCustomUrlInput(false);
                            }
                          }}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-[11px] font-bold"
                        >
                          Set
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-300 font-medium text-xs">Admin Secret Code</label>
                      <span className="text-[10px] text-emerald-400 font-mono">Admin verification required</span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type={showCreateSecret ? 'text' : 'password'}
                        placeholder="Enter Admin Secret Code"
                        value={newCircleSecretCode}
                        onChange={(e) => setNewCircleSecretCode(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono tracking-wider focus:outline-none focus:border-emerald-500 text-xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreateSecret(!showCreateSecret)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                        title={showCreateSecret ? 'Hide secret code' : 'Show secret code'}
                      >
                        {showCreateSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Only authorized Circle Admins who know the secret code can create a circle.
                    </p>
                  </div>

                  {createError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                      <span>{createError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-2xl font-extrabold shadow-[0_6px_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Circle &amp; Enter as Admin</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: MEMBER LOGIN */}
          {activeTab === 'member' && (
            circles.length === 0 ? (
              <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 text-center space-y-2.5 animate-in fade-in duration-200">
                <Users className="w-8 h-8 text-slate-500 mx-auto" />
                <h4 className="text-xs font-bold text-slate-200">No Circles Found</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your Circle Admin has not set up a squad circle yet. Please ask your administrator to create the circle first.
                </p>
              </div>
            ) : (
              <form onSubmit={handleMemberSignIn} className="space-y-4 text-xs sm:text-sm animate-in fade-in duration-200">
                <div>
                  <label className="block text-slate-300 font-medium mb-1 text-xs">Select Circle</label>
                  <select
                    value={selectedCircleId}
                    onChange={(e) => setSelectedCircleId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {circles.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 text-xs">Registered Mobile Number</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="Enter registered mobile number"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 text-xs">Account Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showMemberPassword ? 'text' : 'password'}
                    placeholder="Enter your account password"
                    value={memberPassword}
                    onChange={(e) => setMemberPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowMemberPassword(!showMemberPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                  >
                    {showMemberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {memberError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{memberError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-2xl font-extrabold shadow-[0_6px_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Users className="w-4 h-4" />
                <span>Sign In as Squad Member</span>
              </button>
            </form>
            )
          )}

          {/* Member Restrictions Notice */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Role Security Active:</strong> Circle Admins have full access to record money, add expenses, and view the common ledger. Squad members enjoy a clean, view-and-request experience.
            </span>
          </div>
        </div>
      </main>

      {/* Supabase Anon Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Supabase Connection</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                  Project URL:
                </span>
                <span className="font-mono text-emerald-400 break-all text-xs">
                  {SUPABASE_URL}
                </span>
              </div>

              <form onSubmit={handleSaveAnonKey} className="space-y-3">
                <div>
                  <label className="block text-slate-200 font-medium mb-1">
                    Supabase Public Anon Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={inputAnonKey}
                    onChange={(e) => setInputAnonKey(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Find this in your Supabase Dashboard: <strong>Project Settings &gt; API &gt; anon / public key</strong>.
                  </p>
                </div>

                {keySavedMessage && (
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{keySavedMessage}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
                  >
                    Save &amp; Connect
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-slate-800/60 text-center text-xs text-slate-500 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="font-cute" style={{ fontFamily: "'Comfortaa', 'Fredoka', 'Quicksand', cursive, sans-serif" }}>
          Ithanu_njangal &bull; Double-Entry Transparent Squad Banking
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Supabase: {SUPABASE_URL.replace('https://', '')}
        </span>
      </footer>
    </div>
  );
};
