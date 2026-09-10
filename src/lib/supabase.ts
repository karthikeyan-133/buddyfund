import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Circle,
  User,
  CircleMember,
  ContributionRecord,
  Transaction,
  Expense,
  Tour,
  Loan,
  LoanApprovalVote,
  LoanInstallment,
  Goal,
  Vote,
  VoteOption,
  AuditLog,
} from '../types';

// Supabase project URL from user configuration
export const SUPABASE_URL =
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL ||
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://tlrzxjhnypxyrjkbiigl.supabase.co';

// Helper to get anon key from env or localStorage
export function getAnonKey(): string {
  const envKey =
    (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    '';
  if (envKey && envKey.trim().length > 0) return envKey.trim().replace(/^["']|["']$/g, '');

  try {
    const localKey = localStorage.getItem('buddyfund_supabase_anon_key');
    if (localKey && localKey.trim().length > 0) return localKey.trim().replace(/^["']|["']$/g, '');
  } catch {
    // Ignore localStorage errors
  }
  return '';
}

export function saveAnonKey(key: string): void {
  try {
    localStorage.setItem('buddyfund_supabase_anon_key', key.trim());
  } catch (err) {
    console.error('Failed to save Supabase anon key to localStorage', err);
  }
}

// Global Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const key = getAnonKey();
  if (!key) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(SUPABASE_URL, key);
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export function isSupabaseConnected(): boolean {
  return getAnonKey().length > 10;
}

// Local storage backup / clean state persistence
const STORAGE_PREFIX = 'buddyfund_data_';

const PERMANENTLY_DELETED_CIRCLE_IDS = ['circle-1788853922321'];

export function isCircleDeleted(circleId: string): boolean {
  if (PERMANENTLY_DELETED_CIRCLE_IDS.includes(circleId)) return true;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}deleted_circle_ids`);
    if (raw) {
      const parsed: string[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.includes(circleId)) return true;
    }
  } catch {}
  return false;
}

export function markCircleDeleted(circleId: string): void {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}deleted_circle_ids`);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(circleId)) {
      list.push(circleId);
      localStorage.setItem(`${STORAGE_PREFIX}deleted_circle_ids`, JSON.stringify(list));
    }
  } catch {}
}

export function loadLocalState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (key === 'circles' && Array.isArray(parsed)) {
        return parsed.filter((c: any) => !isCircleDeleted(c.id)) as unknown as T;
      }
      return parsed;
    }
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
  }
  return fallback;
}

export function saveLocalState<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error writing ${key} to storage:`, err);
  }
}

// ==================== DATABASE CRUD OPERATIONS ====================

// Circles
export async function dbFetchCircles(): Promise<Circle[]> {
  const client = getSupabaseClient();
  if (!client) {
    return loadLocalState<Circle[]>('circles', []).filter((c) => !isCircleDeleted(c.id));
  }
  try {
    const { data, error } = await client.from('circles').select('*');
    if (error) throw error;
    if (data) {
      // Purge any blacklisted or deleted circle from Supabase database if still found
      for (const c of data) {
        if (isCircleDeleted(c.id)) {
          console.log(`Supabase: Purging deleted circle from DB: ${c.id}`);
          client.from('circle_members').delete().eq('circle_id', c.id);
          client.from('contributions').delete().eq('circle_id', c.id);
          client.from('expenses').delete().eq('circle_id', c.id);
          client.from('loans').delete().eq('circle_id', c.id);
          client.from('transactions').delete().eq('circle_id', c.id);
          client.from('circles').delete().eq('id', c.id);
        }
      }

      const validCircles = data.filter((c: any) => !isCircleDeleted(c.id));
      const mapped: Circle[] = validCircles.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        photoUrl: c.photo_url || '',
        currency: c.currency || 'INR',
        currencySymbol: c.currency_symbol || '₹',
        contributionFrequency: c.contribution_frequency || 'weekly',
        contributionAmount: Number(c.contribution_amount || 500),
        contributionDay: c.contribution_day || 'Sunday',
        startDate: c.start_date || new Date().toISOString().split('T')[0],
        expectedMembers: Number(c.expected_members || 10),
        rules: Array.isArray(c.rules) ? c.rules : [],
        createdBy: c.created_by || '',
        createdAt: c.created_at || new Date().toISOString(),
        planTier: 'free',
        inviteCode: c.invite_code || '',
        adminSecretCode: c.admin_secret_code || 'ADMIN2026',
        adminName: c.admin_name || c.created_by || 'Circle Admin',
        adminPhotoUrl: c.admin_photo_url || '',
      }));
      saveLocalState('circles', mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase fetchCircles error, using local state:', err);
  }
  return loadLocalState<Circle[]>('circles', []).filter((c) => !isCircleDeleted(c.id));
}

export async function dbUpsertCircle(circle: Circle): Promise<void> {
  if (isCircleDeleted(circle.id)) {
    console.warn(`Supabase: Circle '${circle.id}' is deleted. Skipping upsert.`);
    return;
  }
  const circles = loadLocalState<Circle[]>('circles', []);
  const index = circles.findIndex((c) => c.id === circle.id);
  if (index >= 0) {
    circles[index] = circle;
  } else {
    circles.unshift(circle);
  }
  saveLocalState('circles', circles.filter((c) => !isCircleDeleted(c.id)));

  const client = getSupabaseClient();
  if (client) {
    try {
      const basePayload: any = {
        id: circle.id,
        name: circle.name,
        description: circle.description || '',
        photo_url: circle.photoUrl || '',
        currency: circle.currency || 'INR',
        currency_symbol: circle.currencySymbol || '₹',
        contribution_frequency: circle.contributionFrequency || 'weekly',
        contribution_amount: Number(circle.contributionAmount || 500),
        contribution_day: circle.contributionDay || 'Sunday',
        start_date: circle.startDate || new Date().toISOString().split('T')[0],
        expected_members: Number(circle.expectedMembers || 10),
        rules: Array.isArray(circle.rules) ? circle.rules : [],
        created_by: circle.adminName || circle.createdBy || 'Circle Admin',
        admin_secret_code: circle.adminSecretCode || 'ADMIN2026',
        invite_code: circle.inviteCode || '',
      };

      const fullPayload = {
        ...basePayload,
        admin_name: circle.adminName || circle.createdBy || 'Circle Admin',
        admin_photo_url: circle.adminPhotoUrl || '',
      };

      const { error: fullError } = await client.from('circles').upsert(fullPayload);
      if (fullError) {
        console.warn('Supabase: full circle schema upsert failed, retrying with base columns:', fullError.message);
        const { error: baseError } = await client.from('circles').upsert(basePayload);
        if (baseError) {
          console.error('Supabase: base circle upsert failed:', baseError.message);
        } else {
          console.log(`Supabase: Circle '${circle.name}' successfully saved.`);
        }
      } else {
        console.log(`Supabase: Circle '${circle.name}' successfully saved with admin fields.`);
      }
    } catch (err) {
      console.warn('Supabase upsertCircle exception:', err);
    }
  }
}

export async function dbDeleteCircle(circleId: string): Promise<void> {
  markCircleDeleted(circleId);

  const circles = loadLocalState<Circle[]>('circles', []);
  const filtered = circles.filter((c) => c.id !== circleId);
  saveLocalState('circles', filtered);

  // Also purge linked entities from local state
  saveLocalState('members', loadLocalState<CircleMember[]>('members', []).filter((m) => m.circleId !== circleId));
  saveLocalState('contributions', loadLocalState<ContributionRecord[]>('contributions', []).filter((c) => c.circleId !== circleId));
  saveLocalState('expenses', loadLocalState<Expense[]>('expenses', []).filter((e) => e.circleId !== circleId));
  saveLocalState('loans', loadLocalState<Loan[]>('loans', []).filter((l) => l.circleId !== circleId));
  saveLocalState('transactions', loadLocalState<Transaction[]>('transactions', []).filter((t) => t.circleId !== circleId));
  saveLocalState('votes', loadLocalState<Vote[]>('votes', []).filter((v) => v.circleId !== circleId));
  saveLocalState('goals', loadLocalState<Goal[]>('goals', []).filter((g) => g.circleId !== circleId));

  const client = getSupabaseClient();
  if (client) {
    try {
      // Delete child records first to satisfy foreign key constraints
      await client.from('votes').delete().eq('circle_id', circleId);
      await client.from('goals').delete().eq('circle_id', circleId);
      await client.from('contributions').delete().eq('circle_id', circleId);
      await client.from('expenses').delete().eq('circle_id', circleId);
      await client.from('loans').delete().eq('circle_id', circleId);
      await client.from('transactions').delete().eq('circle_id', circleId);
      await client.from('circle_members').delete().eq('circle_id', circleId);
      const { error } = await client.from('circles').delete().eq('id', circleId);
      if (error) {
        console.error('Supabase deleteCircle error:', error.message);
      } else {
        console.log(`Supabase: Circle '${circleId}' permanently deleted.`);
      }
    } catch (err) {
      console.warn('Supabase deleteCircle error:', err);
    }
  }
}

// Members
export async function dbFetchMembers(circleId: string): Promise<CircleMember[]> {
  const client = getSupabaseClient();
  if (!client) {
    const all = loadLocalState<CircleMember[]>('members', []);
    return all.filter((m) => m.circleId === circleId);
  }
  try {
    const { data, error } = await client.from('circle_members').select('*').eq('circle_id', circleId);
    if (error) throw error;
    if (data && data.length > 0) {
      const mapped: CircleMember[] = data.map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        circleId: m.circle_id,
        name: m.name,
        email: m.email || '',
        phone: m.phone || '',
        avatarUrl: m.avatar_url || '',
        role: m.role || 'member',
        joinedDate: m.joined_date || '',
        totalContributed: Number(m.total_contributed || 0),
        totalReceived: Number(m.total_received || 0),
        pendingContribution: Number(m.pending_contribution || 0),
        outstandingLoan: Number(m.outstanding_loan || 0),
        loanRepaymentStatus: m.loan_repayment_status || 'none',
        password: m.password || '',
      }));
      // Merge with local state
      const local = loadLocalState<CircleMember[]>('members', []);
      const remaining = local.filter((m) => m.circleId !== circleId);
      saveLocalState('members', [...mapped, ...remaining]);
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase fetchMembers error, using local state:', err);
  }
  const all = loadLocalState<CircleMember[]>('members', []);
  return all.filter((m) => m.circleId === circleId);
}

export async function dbUpsertMember(member: CircleMember): Promise<void> {
  const members = loadLocalState<CircleMember[]>('members', []);
  const index = members.findIndex((m) => m.id === member.id);
  if (index >= 0) {
    members[index] = member;
  } else {
    members.push(member);
  }
  saveLocalState('members', members);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('circle_members').upsert({
        id: member.id,
        user_id: member.userId,
        circle_id: member.circleId,
        name: member.name,
        email: member.email,
        phone: member.phone,
        avatar_url: member.avatarUrl,
        role: member.role,
        joined_date: member.joinedDate,
        total_contributed: member.totalContributed,
        total_received: member.totalReceived,
        pending_contribution: member.pendingContribution,
        outstanding_loan: member.outstandingLoan,
        loan_repayment_status: member.loanRepaymentStatus,
        password: member.password || '',
      });
    } catch (err) {
      console.warn('Supabase upsertMember error:', err);
    }
  }
}

// Transactions
export async function dbFetchTransactions(circleId: string): Promise<Transaction[]> {
  const client = getSupabaseClient();
  if (!client) {
    const all = loadLocalState<Transaction[]>('transactions', []);
    return all.filter((t) => t.circleId === circleId);
  }
  try {
    const { data, error } = await client
      .from('transactions')
      .select('*')
      .eq('circle_id', circleId)
      .order('date', { ascending: false });
    if (error) throw error;
    if (data) {
      const mapped: Transaction[] = data.map((t: any) => ({
        id: t.id,
        circleId: t.circle_id,
        memberId: t.member_id,
        memberName: t.member_name,
        amount: Number(t.amount || 0),
        type: t.type,
        category: t.category,
        date: t.date,
        reference: t.reference,
        createdBy: t.created_by,
        notes: t.notes,
        receiptUrl: t.receipt_url,
        auditInfo: t.audit_info,
      }));
      const local = loadLocalState<Transaction[]>('transactions', []);
      const remaining = local.filter((t) => t.circleId !== circleId);
      saveLocalState('transactions', [...mapped, ...remaining]);
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase fetchTransactions error:', err);
  }
  const all = loadLocalState<Transaction[]>('transactions', []);
  return all.filter((t) => t.circleId === circleId);
}

export function broadcastTransactionUpdate(tx: Transaction): void {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('buddyfund_realtime_transactions');
      bc.postMessage({ type: 'TRANSACTION_UPDATED', circleId: tx.circleId, tx });
      bc.close();
    }
  } catch {}

  const client = getSupabaseClient();
  if (client) {
    try {
      const ch = client.channel(`realtime-circle-${tx.circleId}`);
      ch.send({
        type: 'broadcast',
        event: 'transaction_updated',
        payload: tx,
      });
    } catch (err) {
      console.warn('Supabase broadcastTransactionUpdate error:', err);
    }
  }
}

export function subscribeToRealtimeTransactions(
  circleId: string,
  onTxUpsert: (tx: Transaction) => void,
  onRefreshNeeded: (latestTxs?: Transaction[]) => void
): () => void {
  const client = getSupabaseClient();
  let supabaseChannel: any = null;

  if (client) {
    try {
      supabaseChannel = client
        .channel(`realtime-circle-${circleId}`)
        .on('broadcast', { event: 'transaction_updated' }, (msg: any) => {
          if (msg?.payload && msg.payload.circleId === circleId) {
            onTxUpsert(msg.payload);
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `circle_id=eq.${circleId}`,
          },
          () => {
            onRefreshNeeded();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase realtime transactions subscription exception:', err);
    }
  }

  // Cross-tab broadcast channel
  let tabChannel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      tabChannel = new BroadcastChannel('buddyfund_realtime_transactions');
      tabChannel.onmessage = (event) => {
        if (event.data?.type === 'TRANSACTION_UPDATED' && event.data.circleId === circleId) {
          onTxUpsert(event.data.tx);
        }
      };
    }
  } catch {}

  // Cross-tab storage listener
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'buddyfund_data_transactions' && e.newValue) {
      try {
        const parsed: Transaction[] = JSON.parse(e.newValue);
        const filtered = parsed.filter((tx) => tx.circleId === circleId);
        if (filtered.length > 0) {
          onRefreshNeeded(filtered);
        }
      } catch {}
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    if (client && supabaseChannel) {
      try {
        client.removeChannel(supabaseChannel);
      } catch {}
    }
    if (tabChannel) {
      tabChannel.close();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

export async function dbInsertTransaction(tx: Transaction): Promise<void> {
  const txs = loadLocalState<Transaction[]>('transactions', []);
  const index = txs.findIndex((t) => t.id === tx.id);
  if (index >= 0) {
    txs[index] = tx;
  } else {
    txs.unshift(tx);
  }
  saveLocalState('transactions', txs);
  broadcastTransactionUpdate(tx);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('transactions').upsert({
        id: tx.id,
        circle_id: tx.circleId,
        member_id: tx.memberId,
        member_name: tx.memberName,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        date: tx.date,
        reference: tx.reference,
        created_by: tx.createdBy,
        notes: tx.notes,
        receipt_url: tx.receiptUrl,
        audit_info: tx.auditInfo,
      });
    } catch (err) {
      console.warn('Supabase insertTransaction error:', err);
    }
  }
}

// Contributions
export async function dbFetchContributions(circleId: string): Promise<ContributionRecord[]> {
  const client = getSupabaseClient();
  if (!client) {
    const all = loadLocalState<ContributionRecord[]>('contributions', []);
    return all.filter((c) => c.circleId === circleId);
  }
  try {
    const { data, error } = await client.from('contributions').select('*').eq('circle_id', circleId);
    if (error) throw error;
    if (data) {
      const mapped: ContributionRecord[] = data.map((c: any) => ({
        id: c.id,
        circleId: c.circle_id,
        userId: c.user_id,
        userName: c.user_name,
        weekNumber: Number(c.week_number),
        weekLabel: c.week_label,
        dueDate: c.due_date,
        amount: Number(c.amount || 0),
        paidAmount: Number(c.paid_amount || 0),
        status: c.status,
        paidDate: c.paid_date,
        paymentMethod: c.payment_method,
        referenceNote: c.reference_note,
        recordedBy: c.recorded_by,
      }));

      // Deduplicate by id and by (circle_id + user_id + due_date) to prevent any duplicate rows
      const seen = new Set<string>();
      const deduplicated: ContributionRecord[] = [];
      for (const m of mapped) {
        const key = `${m.circleId}_${m.userId}_${m.dueDate}`;
        if (!seen.has(key) && !seen.has(m.id)) {
          seen.add(key);
          seen.add(m.id);
          deduplicated.push(m);
        }
      }

      const local = loadLocalState<ContributionRecord[]>('contributions', []);
      const remaining = local.filter((c) => c.circleId !== circleId);
      saveLocalState('contributions', [...deduplicated, ...remaining]);
      return deduplicated;
    }
  } catch (err) {
    console.warn('Supabase fetchContributions error:', err);
  }
  const all = loadLocalState<ContributionRecord[]>('contributions', []);
  return all.filter((c) => c.circleId === circleId);
}

// Dedicated shared BroadcastChannel for contributions
let sharedContribBC: BroadcastChannel | null = null;
function getContribBC(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!sharedContribBC) {
    sharedContribBC = new BroadcastChannel('buddyfund_realtime_contributions');
  }
  return sharedContribBC;
}

// Active Supabase Realtime channel for contributions
let activeContribChannel: any = null;

export function broadcastContributionUpdate(circleId: string, record: ContributionRecord): void {
  // 1. Cross-tab BroadcastChannel (instant in same browser)
  try {
    const bc = getContribBC();
    bc?.postMessage({ type: 'CONTRIBUTION_UPDATED', record });
  } catch {}

  // 2. Same-window custom event
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('buddyfund_contribution_sync', {
          detail: { type: 'CONTRIBUTION_UPDATED', circleId, record },
        })
      );
    }
  } catch {}

  // 3. Supabase Realtime WebSocket broadcast (cross-device, cross-browser)
  const client = getSupabaseClient();
  if (client) {
    try {
      if (activeContribChannel && activeContribChannel.state === 'joined') {
        activeContribChannel.send({
          type: 'broadcast',
          event: 'contribution_updated',
          payload: record,
        });
      } else {
        const sendCh = client.channel(`realtime-contribs-${circleId}`);
        sendCh.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            sendCh.send({
              type: 'broadcast',
              event: 'contribution_updated',
              payload: record,
            });
          }
        });
      }
    } catch (err) {
      console.warn('Supabase broadcastContributionUpdate error:', err);
    }
  }
}

export function broadcastContributionDelete(circleId: string, recordId: string): void {
  try {
    const bc = getContribBC();
    bc?.postMessage({ type: 'CONTRIBUTION_DELETED', circleId, recordId });
  } catch {}

  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('buddyfund_contribution_sync', {
          detail: { type: 'CONTRIBUTION_DELETED', circleId, recordId },
        })
      );
    }
  } catch {}

  const client = getSupabaseClient();
  if (client) {
    try {
      if (activeContribChannel && activeContribChannel.state === 'joined') {
        activeContribChannel.send({
          type: 'broadcast',
          event: 'contribution_deleted',
          payload: { circleId, recordId },
        });
      } else {
        const sendCh = client.channel(`realtime-contribs-${circleId}`);
        sendCh.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            sendCh.send({
              type: 'broadcast',
              event: 'contribution_deleted',
              payload: { circleId, recordId },
            });
          }
        });
      }
    } catch (err) {
      console.warn('Supabase broadcastContributionDelete error:', err);
    }
  }
}

export function subscribeToRealtimeContributions(
  circleId: string,
  onRecordUpsert: (record: ContributionRecord) => void,
  onRecordRemove: (recordId: string) => void,
  onRefreshNeeded: (latestRecords?: ContributionRecord[]) => void
): () => void {
  const client = getSupabaseClient();
  const channelName = `realtime-contribs-${circleId}`;

  // 1. Supabase Realtime WebSocket (cross-device)
  if (client) {
    try {
      if (activeContribChannel) {
        try {
          client.removeChannel(activeContribChannel);
        } catch {}
      }
      activeContribChannel = client.channel(channelName, {
        config: { broadcast: { self: false } },
      });

      activeContribChannel
        .on('broadcast', { event: 'contribution_updated' }, (msg: any) => {
          if (msg?.payload && msg.payload.circleId === circleId) {
            onRecordUpsert(msg.payload);
          }
        })
        .on('broadcast', { event: 'contribution_deleted' }, (msg: any) => {
          if (msg?.payload?.recordId) {
            onRecordRemove(msg.payload.recordId);
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'contributions',
            filter: `circle_id=eq.${circleId}`,
          },
          () => {
            onRefreshNeeded();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase realtime contributions subscription exception:', err);
    }
  }

  // 2. Cross-tab BroadcastChannel
  const bc = getContribBC();
  const handleBCMessage = (event: MessageEvent) => {
    if (event.data?.type === 'CONTRIBUTION_UPDATED' && event.data.record?.circleId === circleId) {
      onRecordUpsert(event.data.record);
    } else if (event.data?.type === 'CONTRIBUTION_DELETED' && event.data.circleId === circleId) {
      onRecordRemove(event.data.recordId);
    }
  };
  if (bc) {
    bc.addEventListener('message', handleBCMessage);
  }

  // 3. Same-window CustomEvent listener
  const handleCustomSync = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail?.circleId === circleId) {
      if (detail.type === 'CONTRIBUTION_UPDATED' && detail.record) {
        onRecordUpsert(detail.record);
      } else if (detail.type === 'CONTRIBUTION_DELETED' && detail.recordId) {
        onRecordRemove(detail.recordId);
      }
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('buddyfund_contribution_sync', handleCustomSync);
  }

  // 4. Cross-tab storage listener (synchronous instant fallback across tabs)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'buddyfund_data_contributions' && e.newValue) {
      try {
        const parsed: ContributionRecord[] = JSON.parse(e.newValue);
        const filtered = parsed.filter((c) => c.circleId === circleId);
        if (filtered.length > 0) {
          onRefreshNeeded(filtered);
        }
      } catch {}
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    if (client && activeContribChannel) {
      try {
        client.removeChannel(activeContribChannel);
      } catch {}
      activeContribChannel = null;
    }
    if (bc) {
      bc.removeEventListener('message', handleBCMessage);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('buddyfund_contribution_sync', handleCustomSync);
      window.removeEventListener('storage', handleStorage);
    }
  };
}

export async function dbUpsertContribution(record: ContributionRecord): Promise<void> {
  const records = loadLocalState<ContributionRecord[]>('contributions', []);
  const index = records.findIndex((r) => r.id === record.id);
  if (index >= 0) {
    records[index] = record;
  } else {
    records.unshift(record);
  }
  saveLocalState('contributions', records);
  broadcastContributionUpdate(record.circleId, record);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('contributions').upsert({
        id: record.id,
        circle_id: record.circleId,
        user_id: record.userId,
        user_name: record.userName,
        week_number: record.weekNumber,
        week_label: record.weekLabel,
        due_date: record.dueDate,
        amount: record.amount,
        paid_amount: record.paidAmount,
        status: record.status,
        paid_date: record.paidDate,
        payment_method: record.paymentMethod,
        reference_note: record.referenceNote,
        recorded_by: record.recordedBy,
      });
    } catch (err) {
      console.warn('Supabase upsertContribution error:', err);
    }
  }
}

// ==================== EXPENSES (DUAL-LAYER CLOUD + REALTIME) ====================

export function broadcastExpenseUpdate(expense: Expense): void {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('buddyfund_realtime_expenses');
      bc.postMessage({ type: 'EXPENSE_UPDATED', circleId: expense.circleId, expense });
      bc.close();
    }
  } catch {}

  const client = getSupabaseClient();
  if (client) {
    try {
      const ch = client.channel(`realtime-circle-${expense.circleId}`);
      ch.send({
        type: 'broadcast',
        event: 'expense_updated',
        payload: expense,
      });
    } catch (err) {
      console.warn('Supabase broadcastExpenseUpdate error:', err);
    }
  }
}

export function broadcastExpenseDelete(circleId: string, expenseId: string): void {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('buddyfund_realtime_expenses');
      bc.postMessage({ type: 'EXPENSE_DELETED', circleId, expenseId });
      bc.close();
    }
  } catch {}

  const client = getSupabaseClient();
  if (client) {
    try {
      const ch = client.channel(`realtime-circle-${circleId}`);
      ch.send({
        type: 'broadcast',
        event: 'expense_deleted',
        payload: { circleId, expenseId },
      });
    } catch (err) {
      console.warn('Supabase broadcastExpenseDelete error:', err);
    }
  }
}

export async function dbFetchExpenses(circleId: string): Promise<Expense[]> {
  const client = getSupabaseClient();
  let tableExpenses: Expense[] = [];

  if (client) {
    try {
      const { data, error } = await client
        .from('expenses')
        .select('*')
        .eq('circle_id', circleId)
        .order('date', { ascending: false });

      if (!error && data && Array.isArray(data)) {
        tableExpenses = data.map((e: any) => ({
          id: e.id,
          circleId: e.circle_id,
          title: e.title,
          amount: Number(e.amount || 0),
          date: e.date,
          category: e.category,
          paidBy: e.paid_by,
          description: e.description || '',
          receiptUrl: e.receipt_url || '',
          participants: Array.isArray(e.participants) ? e.participants : ['all'],
          tourId: e.tour_id || undefined,
          createdAt: e.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetchExpenses from table failed:', err);
    }

    // Dual-tier check: Backup inside circles.rules.__buddyfund_expenses
    try {
      const { data: circleData } = await client
        .from('circles')
        .select('rules')
        .eq('id', circleId)
        .single();

      if (circleData?.rules && Array.isArray(circleData.rules)) {
        const expenseObj = circleData.rules.find((r: any) => r && typeof r === 'object' && r.__buddyfund_expenses);
        if (expenseObj && Array.isArray(expenseObj.__buddyfund_expenses)) {
          const cloudBackupExpenses: Expense[] = expenseObj.__buddyfund_expenses;
          cloudBackupExpenses.forEach((be) => {
            if (!tableExpenses.some((te) => te.id === be.id)) {
              tableExpenses.push(be);
            }
          });
        }
      }
    } catch (err) {
      console.warn('Supabase fetchExpenses from circle rules failed:', err);
    }
  }

  if (tableExpenses.length > 0) {
    const local = loadLocalState<Expense[]>('expenses', []);
    const remaining = local.filter((e) => e.circleId !== circleId);
    saveLocalState('expenses', [...tableExpenses, ...remaining]);
    return tableExpenses;
  }

  const all = loadLocalState<Expense[]>('expenses', []);
  return all.filter((e) => e.circleId === circleId);
}

export async function dbUpsertExpense(expense: Expense): Promise<void> {
  const expenses = loadLocalState<Expense[]>('expenses', []);
  const index = expenses.findIndex((e) => e.id === expense.id);
  let updated: Expense[];
  if (index >= 0) {
    updated = [...expenses];
    updated[index] = expense;
  } else {
    updated = [expense, ...expenses];
  }
  saveLocalState('expenses', updated);
  broadcastExpenseUpdate(expense);

  const client = getSupabaseClient();
  if (client) {
    // 1. Write to public.expenses table
    try {
      await client.from('expenses').upsert({
        id: expense.id,
        circle_id: expense.circleId,
        title: expense.title,
        amount: expense.amount,
        date: expense.date,
        category: expense.category,
        paid_by: expense.paidBy,
        description: expense.description,
        receipt_url: expense.receiptUrl,
        participants: expense.participants,
        tour_id: expense.tourId,
      });
    } catch (err) {
      console.warn('Supabase upsert expenses table error:', err);
    }

    // 2. Dual-tier persistence to circles.rules.__buddyfund_expenses
    try {
      const { data: circleData } = await client
        .from('circles')
        .select('rules')
        .eq('id', expense.circleId)
        .single();

      if (circleData) {
        let rulesArr: any[] = Array.isArray(circleData.rules) ? [...circleData.rules] : [];
        let expIdx = rulesArr.findIndex((r: any) => r && typeof r === 'object' && r.__buddyfund_expenses);
        let existingExpenses: Expense[] = [];
        if (expIdx >= 0) {
          existingExpenses = rulesArr[expIdx].__buddyfund_expenses || [];
        }

        const foundIndex = existingExpenses.findIndex((e) => e.id === expense.id);
        if (foundIndex >= 0) {
          existingExpenses[foundIndex] = expense;
        } else {
          existingExpenses = [expense, ...existingExpenses];
        }

        if (expIdx >= 0) {
          rulesArr[expIdx] = { __buddyfund_expenses: existingExpenses };
        } else {
          rulesArr.push({ __buddyfund_expenses: existingExpenses });
        }

        await client.from('circles').update({ rules: rulesArr }).eq('id', expense.circleId);
      }
    } catch (err) {
      console.warn('Supabase upsertExpense into circle rules error:', err);
    }
  }
}

export const dbInsertExpense = dbUpsertExpense;

export async function dbDeleteExpense(circleId: string, expenseId: string): Promise<void> {
  const expenses = loadLocalState<Expense[]>('expenses', []);
  const updated = expenses.filter((e) => e.id !== expenseId);
  saveLocalState('expenses', updated);
  broadcastExpenseDelete(circleId, expenseId);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('expenses').delete().eq('id', expenseId);
    } catch (err) {
      console.warn('Supabase delete expense table error:', err);
    }

    try {
      const { data: circleData } = await client
        .from('circles')
        .select('rules')
        .eq('id', circleId)
        .single();

      if (circleData && Array.isArray(circleData.rules)) {
        let rulesArr = [...circleData.rules];
        let expIdx = rulesArr.findIndex((r: any) => r && typeof r === 'object' && r.__buddyfund_expenses);
        if (expIdx >= 0) {
          let list: Expense[] = rulesArr[expIdx].__buddyfund_expenses || [];
          list = list.filter((e) => e.id !== expenseId);
          rulesArr[expIdx] = { __buddyfund_expenses: list };
          await client.from('circles').update({ rules: rulesArr }).eq('id', circleId);
        }
      }
    } catch (err) {
      console.warn('Supabase deleteExpense from rules error:', err);
    }
  }
}

export function subscribeToRealtimeExpenses(
  circleId: string,
  onExpenseUpsert: (expense: Expense) => void,
  onExpenseRemove: (expenseId: string) => void,
  onRefreshNeeded: (latestExpenses?: Expense[]) => void
): () => void {
  const client = getSupabaseClient();
  let supabaseChannel: any = null;

  if (client) {
    try {
      supabaseChannel = client
        .channel(`realtime-circle-${circleId}`)
        .on('broadcast', { event: 'expense_updated' }, (msg: any) => {
          if (msg?.payload && msg.payload.circleId === circleId) {
            onExpenseUpsert(msg.payload);
          }
        })
        .on('broadcast', { event: 'expense_deleted' }, (msg: any) => {
          if (msg?.payload?.expenseId) {
            onExpenseRemove(msg.payload.expenseId);
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'expenses',
            filter: `circle_id=eq.${circleId}`,
          },
          () => {
            onRefreshNeeded();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase realtime expenses subscription exception:', err);
    }
  }

  // Cross-tab broadcast channel
  let tabChannel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      tabChannel = new BroadcastChannel('buddyfund_realtime_expenses');
      tabChannel.onmessage = (event) => {
        if (event.data?.type === 'EXPENSE_UPDATED' && event.data.circleId === circleId) {
          onExpenseUpsert(event.data.expense);
        } else if (event.data?.type === 'EXPENSE_DELETED' && event.data.circleId === circleId) {
          onExpenseRemove(event.data.expenseId);
        }
      };
    }
  } catch {}

  // Cross-tab storage listener
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'buddyfund_data_expenses' && e.newValue) {
      try {
        const parsed: Expense[] = JSON.parse(e.newValue);
        const filtered = parsed.filter((ex) => ex.circleId === circleId);
        if (filtered.length > 0) {
          onRefreshNeeded(filtered);
        }
      } catch {}
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    if (client && supabaseChannel) {
      try {
        client.removeChannel(supabaseChannel);
      } catch {}
    }
    if (tabChannel) {
      tabChannel.close();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

// Loans
export async function dbFetchLoans(circleId: string): Promise<Loan[]> {
  const client = getSupabaseClient();
  if (!client) {
    const all = loadLocalState<Loan[]>('loans', []);
    return all.filter((l) => l.circleId === circleId);
  }
  try {
    const { data, error } = await client.from('loans').select('*').eq('circle_id', circleId);
    if (error) throw error;
    if (data) {
      const local = loadLocalState<Loan[]>('loans', []);
      const mapped: Loan[] = data.map((l: any) => {
        const existing = local.find((x) => x.id === l.id);
        let installments: LoanInstallment[] = [];
        let approvals: LoanApprovalVote[] = existing?.approvals || [];
        if (Array.isArray(l.repayments)) {
          installments = l.repayments;
        } else if (l.repayments && typeof l.repayments === 'object') {
          installments = Array.isArray(l.repayments.installments) ? l.repayments.installments : [];
          if (Array.isArray(l.repayments.approvals)) {
            approvals = l.repayments.approvals;
          }
        }

        return {
          id: l.id,
          circleId: l.circle_id,
          borrowerId: l.borrower_id,
          borrowerName: l.borrower_name,
          borrowerAvatar: l.borrower_avatar || '',
          principal: Number(l.principal),
          interestRate: Number(l.interest_rate || 5),
          interestType: (l.interest_type as any) || 'Monthly',
          durationMonths: Number(l.duration_months || 1),
          startDate: l.start_date,
          dueDate: l.due_date,
          monthlyInterest: Math.round((Number(l.principal) * Number(l.interest_rate || 5)) / 100),
          totalInterest: Number(l.total_repayment) - Number(l.principal),
          totalRepayment: Number(l.total_repayment),
          principalPaid: Math.max(0, Number(l.principal) - Number(l.remaining_amount)),
          interestPaid: 0,
          totalPaid: Math.max(0, Number(l.total_repayment) - Number(l.remaining_amount)),
          remainingAmount: Number(l.remaining_amount),
          status: l.status,
          purpose: l.purpose || '',
          installments,
          approvals,
          repaymentMethod: l.repayment_method || existing?.repaymentMethod || (Number(l.monthly_emi) > 0 && existing?.repaymentMethod === 'weekly_emi' ? 'weekly_emi' : 'ten_day_cycle'),
          cycleDays: l.cycle_days || existing?.cycleDays || 10,
          tenureWeeks: l.tenure_weeks || existing?.tenureWeeks || 4,
          weeklyEmiAmount: Number(l.monthly_emi) || existing?.weeklyEmiAmount || 0,
        };
      });
      const remaining = local.filter((l) => l.circleId !== circleId);
      saveLocalState('loans', [...mapped, ...remaining]);
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase fetchLoans error, using local state:', err);
  }
  const all = loadLocalState<Loan[]>('loans', []);
  return all.filter((l) => l.circleId === circleId);
}

export async function dbUpsertLoan(loan: Loan): Promise<void> {
  const loans = loadLocalState<Loan[]>('loans', []);
  const index = loans.findIndex((l) => l.id === loan.id);
  if (index >= 0) {
    loans[index] = loan;
  } else {
    loans.unshift(loan);
  }
  saveLocalState('loans', loans);

  const client = getSupabaseClient();
  if (client) {
    try {
      const payload = {
        id: loan.id,
        circle_id: loan.circleId,
        borrower_id: loan.borrowerId,
        borrower_name: loan.borrowerName,
        borrower_avatar: loan.borrowerAvatar || '',
        principal: loan.principal,
        interest_rate: loan.interestRate,
        interest_type: loan.interestType,
        duration_months: loan.durationMonths,
        start_date: loan.startDate,
        due_date: loan.dueDate,
        total_repayment: loan.totalRepayment,
        remaining_amount: loan.remainingAmount,
        monthly_emi: loan.monthlyInterest,
        purpose: loan.purpose,
        status: loan.status,
        repayments: {
          installments: loan.installments || [],
          approvals: loan.approvals || [],
        },
      };
      const { error } = await client.from('loans').upsert(payload);
      if (error) {
        console.error('Supabase upsertLoan error:', error.message);
      } else {
        console.log(`Supabase: Loan '${loan.id}' saved successfully with consensus approvals.`);
      }
    } catch (err) {
      console.warn('Supabase upsertLoan exception:', err);
    }
  }

  broadcastLoanUpdate(loan);
}

export function broadcastLoanUpdate(loan: Loan): void {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('buddyfund_realtime_loans');
      bc.postMessage({ type: 'LOAN_UPDATED', loan });
      bc.close();
    }
  } catch {}

  const client = getSupabaseClient();
  if (client) {
    try {
      const ch = client.channel(`realtime-circle-${loan.circleId}`);
      ch.send({
        type: 'broadcast',
        event: 'loan_updated',
        payload: loan,
      });
    } catch (err) {
      console.warn('Supabase broadcastLoanUpdate error:', err);
    }
  }
}

export function subscribeToRealtimeLoans(
  circleId: string,
  onLoanUpsert: (updatedLoan: Loan) => void,
  onRefreshNeeded?: () => void
): () => void {
  let bc: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('buddyfund_realtime_loans');
      bc.onmessage = (event) => {
        if (event.data?.type === 'LOAN_UPDATED' && event.data.loan?.circleId === circleId) {
          onLoanUpsert(event.data.loan);
        }
      };
    }
  } catch {}

  const onStorage = (e: StorageEvent) => {
    if (e.key === 'buddyfund_loans' && onRefreshNeeded) {
      onRefreshNeeded();
    }
  };
  window.addEventListener('storage', onStorage);

  let supabaseChannel: any = null;
  const client = getSupabaseClient();
  if (client) {
    try {
      supabaseChannel = client
        .channel(`realtime-loans-${circleId}`)
        .on('broadcast', { event: 'loan_updated' }, (payload: any) => {
          if (payload?.payload && payload.payload.circleId === circleId) {
            onLoanUpsert(payload.payload);
          }
        })
        .subscribe();
    } catch (err) {
      console.warn('Supabase subscribeToRealtimeLoans error:', err);
    }
  }

  return () => {
    try {
      if (bc) bc.close();
    } catch {}
    window.removeEventListener('storage', onStorage);
    if (supabaseChannel && client) {
      try {
        client.removeChannel(supabaseChannel);
      } catch {}
    }
  };
}

// =================================================================
// Voting & Decision Polls Database Handlers
// =================================================================
export async function dbFetchVotes(circleId: string): Promise<Vote[]> {
  const client = getSupabaseClient();
  if (!client) {
    const all = loadLocalState<Vote[]>('votes', []);
    return all.filter((v) => v.circleId === circleId);
  }
  try {
    const { data, error } = await client
      .from('votes')
      .select('*')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchVotes error, using local state:', error.message);
    } else if (data) {
      const local = loadLocalState<Vote[]>('votes', []);
      const mapped: Vote[] = data.map((v: any) => {
        const existingLocal = local.find((l) => l.id === v.id);
        const rawOptions = Array.isArray(v.options) ? v.options : [];
        const options: VoteOption[] = rawOptions.map((opt: any, idx: number) => ({
          id: opt.id || `opt-${idx + 1}-${Date.now()}`,
          text: opt.text || (idx === 0 ? '👍 Yes, approve proposal' : '👎 Reject proposal'),
          votesCount: Number(opt.votesCount ?? opt.votes_count ?? 0),
          voterIds: Array.isArray(opt.voterIds) ? opt.voterIds : Array.isArray(opt.voter_ids) ? opt.voter_ids : [],
          voters: Array.isArray(opt.voters) ? opt.voters : [],
        }));

        const statusStr = (v.status || 'Active').toLowerCase();
        let deadline = '2026-11-30';
        if (v.expires_at) {
          deadline = typeof v.expires_at === 'string' && v.expires_at.includes('T')
            ? v.expires_at.split('T')[0]
            : String(v.expires_at);
        } else if (existingLocal?.deadline) {
          deadline = existingLocal.deadline;
        }

        return {
          id: v.id,
          circleId: v.circle_id,
          title: v.title,
          description: v.description || '',
          category: (v.category as any) || existingLocal?.category || 'Rule Change',
          options,
          status: statusStr === 'closed' ? 'closed' : 'active',
          deadline,
          createdBy: v.created_by || existingLocal?.createdBy || 'Circle Member',
          createdAt: v.created_at || existingLocal?.createdAt || new Date().toISOString(),
          thresholdPercentage: Number(v.threshold_percentage || existingLocal?.thresholdPercentage || 60),
          result: v.result || existingLocal?.result || undefined,
        };
      });

      const remaining = local.filter((l) => l.circleId !== circleId);
      saveLocalState('votes', [...mapped, ...remaining]);
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase fetchVotes error, using local state:', err);
  }
  const all = loadLocalState<Vote[]>('votes', []);
  return all.filter((v) => v.circleId === circleId);
}

export async function dbUpsertVote(vote: Vote): Promise<void> {
  const votes = loadLocalState<Vote[]>('votes', []);
  const index = votes.findIndex((v) => v.id === vote.id);
  if (index >= 0) {
    votes[index] = vote;
  } else {
    votes.unshift(vote);
  }
  saveLocalState('votes', votes);

  const client = getSupabaseClient();
  if (client) {
    try {
      const basePayload: any = {
        id: vote.id,
        circle_id: vote.circleId,
        title: vote.title,
        description: vote.description || '',
        options: Array.isArray(vote.options) ? vote.options : [],
        created_by: vote.createdBy || 'Circle Member',
        created_at: vote.createdAt || new Date().toISOString(),
        expires_at: vote.deadline ? (vote.deadline.includes('T') ? vote.deadline : `${vote.deadline}T23:59:59Z`) : null,
        status: vote.status === 'closed' ? 'Closed' : 'Active',
      };

      const fullPayload = {
        ...basePayload,
        category: vote.category || 'Rule Change',
        threshold_percentage: Number(vote.thresholdPercentage || 60),
        result: vote.result || '',
      };

      const { error: fullError } = await client.from('votes').upsert(fullPayload);
      if (fullError) {
        console.warn('Supabase: full vote schema upsert failed, retrying with base columns:', fullError.message);
        const { error: baseError } = await client.from('votes').upsert(basePayload);
        if (baseError) {
          console.error('Supabase: base vote upsert failed:', baseError.message);
        } else {
          console.log(`Supabase: Vote '${vote.title}' successfully saved with base columns.`);
        }
      } else {
        console.log(`Supabase: Vote '${vote.title}' successfully saved with full fields.`);
      }
    } catch (err) {
      console.warn('Supabase upsertVote exception:', err);
    }
  }

  // Immediately broadcast change across tabs and devices
  broadcastVoteUpdate(vote);
}

export async function dbDeleteVote(voteId: string, circleId?: string): Promise<void> {
  const votes = loadLocalState<Vote[]>('votes', []);
  const target = votes.find((v) => v.id === voteId);
  const effectiveCircleId = circleId || target?.circleId || '';
  const filtered = votes.filter((v) => v.id !== voteId);
  saveLocalState('votes', filtered);

  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('votes').delete().eq('id', voteId);
      if (error) {
        console.error('Supabase deleteVote error:', error.message);
      } else {
        console.log(`Supabase: Vote '${voteId}' deleted.`);
      }
    } catch (err) {
      console.warn('Supabase deleteVote error:', err);
    }
  }

  if (effectiveCircleId) {
    broadcastVoteDelete(effectiveCircleId, voteId);
  }
}

// =================================================================
// Realtime Broadcast & Instant Synchronization
// =================================================================
export function broadcastVoteUpdate(vote: Vote): void {
  // 1. Cross-tab instant communication via BroadcastChannel
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('buddyfund_realtime_votes');
      bc.postMessage({ type: 'VOTE_UPDATED', vote });
      bc.close();
    }
  } catch {}

  // 2. Cross-device instant communication via Supabase Realtime Channel
  const client = getSupabaseClient();
  if (client) {
    try {
      const ch = client.channel(`realtime-circle-${vote.circleId}`);
      ch.send({
        type: 'broadcast',
        event: 'vote_updated',
        payload: vote,
      });
    } catch (err) {
      console.warn('Supabase broadcastVoteUpdate error:', err);
    }
  }
}

export function broadcastVoteDelete(circleId: string, voteId: string): void {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('buddyfund_realtime_votes');
      bc.postMessage({ type: 'VOTE_DELETED', circleId, voteId });
      bc.close();
    }
  } catch {}

  const client = getSupabaseClient();
  if (client) {
    try {
      const ch = client.channel(`realtime-circle-${circleId}`);
      ch.send({
        type: 'broadcast',
        event: 'vote_deleted',
        payload: { circleId, voteId },
      });
    } catch (err) {
      console.warn('Supabase broadcastVoteDelete error:', err);
    }
  }
}

export function subscribeToRealtimeVotes(
  circleId: string,
  onVoteUpsert: (updatedVote: Vote) => void,
  onVoteRemove: (voteId: string) => void,
  onRefreshNeeded: () => void
): () => void {
  const client = getSupabaseClient();
  let supabaseChannel: any = null;

  if (client) {
    try {
      supabaseChannel = client
        .channel(`realtime-circle-${circleId}`)
        .on('broadcast', { event: 'vote_updated' }, (msg: any) => {
          if (msg?.payload && msg.payload.circleId === circleId) {
            onVoteUpsert(msg.payload);
          }
        })
        .on('broadcast', { event: 'vote_deleted' }, (msg: any) => {
          if (msg?.payload?.voteId) {
            onVoteRemove(msg.payload.voteId);
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'votes',
            filter: `circle_id=eq.${circleId}`,
          },
          () => {
            onRefreshNeeded();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase realtime subscription exception:', err);
    }
  }

  // Cross-tab broadcast channel
  let tabChannel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      tabChannel = new BroadcastChannel('buddyfund_realtime_votes');
      tabChannel.onmessage = (event) => {
        if (event.data?.type === 'VOTE_UPDATED' && event.data.vote?.circleId === circleId) {
          onVoteUpsert(event.data.vote);
        } else if (event.data?.type === 'VOTE_DELETED' && event.data.circleId === circleId) {
          onVoteRemove(event.data.voteId);
        }
      };
    }
  } catch {}

  // Cross-tab storage listener
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'buddyfund_data_votes' && e.newValue) {
      try {
        const parsed: Vote[] = JSON.parse(e.newValue);
        const filtered = parsed.filter((v) => v.circleId === circleId);
        if (filtered.length > 0) {
          onRefreshNeeded();
        }
      } catch {}
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    if (client && supabaseChannel) {
      client.removeChannel(supabaseChannel);
    }
    if (tabChannel) {
      tabChannel.close();
    }
    window.removeEventListener('storage', handleStorage);
  };
}

// =================================================================
// Goals Database Handlers
// =================================================================
export async function dbFetchGoals(circleId: string): Promise<Goal[]> {
  const client = getSupabaseClient();
  if (!client) {
    const all = loadLocalState<Goal[]>('goals', []);
    return all.filter((g) => g.circleId === circleId);
  }
  try {
    const { data, error } = await client
      .from('goals')
      .select('*')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchGoals error:', error.message);
    } else if (data) {
      const local = loadLocalState<Goal[]>('goals', []);
      const mapped: Goal[] = data.map((g: any) => {
        const existing = local.find((l) => l.id === g.id);
        return {
          id: g.id,
          circleId: g.circle_id,
          title: g.title,
          targetAmount: Number(g.target_amount || 0),
          currentAmount: Number(g.current_amount || 0),
          targetDate: g.deadline || existing?.targetDate || '2026-12-31',
          category: (g.category as any) || existing?.category || 'Trip',
          description: existing?.description || 'Dedicated savings allocation goal.',
          icon: existing?.icon || 'Target',
        };
      });
      const remaining = local.filter((g) => g.circleId !== circleId);
      saveLocalState('goals', [...mapped, ...remaining]);
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase fetchGoals error, using local state:', err);
  }
  const all = loadLocalState<Goal[]>('goals', []);
  return all.filter((g) => g.circleId === circleId);
}

export function broadcastGoalUpdate(circleId: string, goal: Goal): void {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('buddyfund_realtime_goals');
      bc.postMessage({ type: 'GOAL_UPDATED', goal });
      bc.close();
    }
  } catch {}

  const client = getSupabaseClient();
  if (client) {
    try {
      const ch = client.channel(`realtime-circle-${circleId}`);
      ch.send({
        type: 'broadcast',
        event: 'goal_updated',
        payload: goal,
      });
    } catch (err) {
      console.warn('Supabase broadcastGoalUpdate error:', err);
    }
  }
}

export function broadcastGoalDelete(circleId: string, goalId: string): void {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('buddyfund_realtime_goals');
      bc.postMessage({ type: 'GOAL_DELETED', circleId, goalId });
      bc.close();
    }
  } catch {}

  const client = getSupabaseClient();
  if (client) {
    try {
      const ch = client.channel(`realtime-circle-${circleId}`);
      ch.send({
        type: 'broadcast',
        event: 'goal_deleted',
        payload: { circleId, goalId },
      });
    } catch (err) {
      console.warn('Supabase broadcastGoalDelete error:', err);
    }
  }
}

export function subscribeToRealtimeGoals(
  circleId: string,
  onGoalUpsert: (goal: Goal) => void,
  onGoalRemove: (goalId: string) => void,
  onRefreshNeeded: () => void
): () => void {
  const client = getSupabaseClient();
  let supabaseChannel: any = null;

  if (client) {
    try {
      supabaseChannel = client
        .channel(`realtime-circle-${circleId}`)
        .on('broadcast', { event: 'goal_updated' }, (msg: any) => {
          if (msg?.payload && msg.payload.circleId === circleId) {
            onGoalUpsert(msg.payload);
          }
        })
        .on('broadcast', { event: 'goal_deleted' }, (msg: any) => {
          if (msg?.payload?.goalId) {
            onGoalRemove(msg.payload.goalId);
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'goals',
            filter: `circle_id=eq.${circleId}`,
          },
          () => {
            onRefreshNeeded();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase realtime goals subscription exception:', err);
    }
  }

  // Cross-tab broadcast channel
  let tabChannel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      tabChannel = new BroadcastChannel('buddyfund_realtime_goals');
      tabChannel.onmessage = (event) => {
        if (event.data?.type === 'GOAL_UPDATED' && event.data.goal?.circleId === circleId) {
          onGoalUpsert(event.data.goal);
        } else if (event.data?.type === 'GOAL_DELETED' && event.data.circleId === circleId) {
          onGoalRemove(event.data.goalId);
        }
      };
    }
  } catch {}

  // Cross-tab storage listener
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'buddyfund_data_goals' && e.newValue) {
      try {
        const parsed: Goal[] = JSON.parse(e.newValue);
        const filtered = parsed.filter((g) => g.circleId === circleId);
        if (filtered.length > 0) {
          onRefreshNeeded();
        }
      } catch {}
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    if (client && supabaseChannel) {
      client.removeChannel(supabaseChannel);
    }
    if (tabChannel) {
      tabChannel.close();
    }
    window.removeEventListener('storage', handleStorage);
  };
}

export async function dbUpsertGoal(goal: Goal): Promise<void> {
  const goals = loadLocalState<Goal[]>('goals', []);
  const index = goals.findIndex((g) => g.id === goal.id);
  if (index >= 0) {
    goals[index] = goal;
  } else {
    goals.unshift(goal);
  }
  saveLocalState('goals', goals);
  broadcastGoalUpdate(goal.circleId, goal);

  const client = getSupabaseClient();
  if (client) {
    try {
      const payload = {
        id: goal.id,
        circle_id: goal.circleId,
        title: goal.title,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        deadline: goal.targetDate || null,
        category: goal.category || 'General',
      };
      const { error } = await client.from('goals').upsert(payload);
      if (error) {
        console.error('Supabase upsertGoal error:', error.message);
      } else {
        console.log(`Supabase: Goal '${goal.title}' saved successfully.`);
      }
    } catch (err) {
      console.warn('Supabase upsertGoal error:', err);
    }
  }
}

export async function dbDeleteGoal(goalId: string, circleId?: string): Promise<void> {
  const goals = loadLocalState<Goal[]>('goals', []);
  const target = goals.find((g) => g.id === goalId);
  const targetCircleId = circleId || target?.circleId;
  const filtered = goals.filter((g) => g.id !== goalId);
  saveLocalState('goals', filtered);

  if (targetCircleId) {
    broadcastGoalDelete(targetCircleId, goalId);
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('goals').delete().eq('id', goalId);
      if (error) {
        console.error('Supabase deleteGoal error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase deleteGoal error:', err);
    }
  }
}

// ==================== TOURS & VACATION PLANNING ====================

export function broadcastTourUpdate(circleId: string, tour: Tour) {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel('buddyfund_realtime_tours');
      ch.postMessage({ type: 'TOUR_UPDATED', circleId, tour });
      ch.close();
    }
  } catch {}
}

export function broadcastTourDelete(circleId: string, tourId: string) {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel('buddyfund_realtime_tours');
      ch.postMessage({ type: 'TOUR_DELETED', circleId, tourId });
      ch.close();
    }
  } catch {}
}

export async function dbFetchTours(circleId: string): Promise<Tour[]> {
  const local = loadLocalState<Tour[]>('tours', []);
  const client = getSupabaseClient();
  if (!client) {
    return local.filter((t) => t.circleId === circleId);
  }

  try {
    let cloudTours: Tour[] = [];

    // 1. Check if 'tours' table exists in Supabase schema
    try {
      const { data, error } = await client.from('tours').select('*').eq('circle_id', circleId);
      if (!error && data && data.length > 0) {
        cloudTours = data.map((t: any) => ({
          id: t.id,
          circleId: t.circle_id,
          title: t.title,
          destination: t.destination,
          duration: t.duration,
          startDate: t.start_date || '',
          endDate: t.end_date || '',
          estimatedBudget: Number(t.estimated_budget || 0),
          allocatedFromCircle: Number(t.allocated_from_circle || 0),
          status: t.status || 'planning',
          bannerUrl: t.banner_url || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
          budgetBreakdown: Array.isArray(t.budget_breakdown) ? t.budget_breakdown : [],
          attendingMemberIds: Array.isArray(t.attending_member_ids) ? t.attending_member_ids : [],
          itinerary: Array.isArray(t.itinerary) ? t.itinerary : [],
          documents: Array.isArray(t.documents) ? t.documents : [],
          notes: t.notes || '',
        }));
      }
    } catch {}

    // 2. Also check circles.rules JSONB payload (for instant zero-setup cross-device cloud persistence)
    if (cloudTours.length === 0) {
      try {
        const { data: circleData } = await client.from('circles').select('rules').eq('id', circleId).maybeSingle();
        if (circleData && Array.isArray(circleData.rules)) {
          for (const item of circleData.rules) {
            if (item && typeof item === 'object' && Array.isArray(item.__buddyfund_tours)) {
              cloudTours = item.__buddyfund_tours.filter((t: Tour) => t.circleId === circleId);
              break;
            }
          }
        }
      } catch {}
    }

    if (cloudTours.length > 0) {
      // Merge with local state, deduplicating by id
      const others = local.filter((t) => t.circleId !== circleId);
      const combined = [...cloudTours, ...others];
      saveLocalState('tours', combined);
      return cloudTours;
    }
  } catch (err) {
    console.warn('Supabase fetchTours error:', err);
  }

  return local.filter((t) => t.circleId === circleId);
}

export async function dbUpsertTour(tour: Tour): Promise<void> {
  const tours = loadLocalState<Tour[]>('tours', []);
  const index = tours.findIndex((t) => t.id === tour.id);
  if (index >= 0) {
    tours[index] = tour;
  } else {
    tours.unshift(tour);
  }
  saveLocalState('tours', tours);
  broadcastTourUpdate(tour.circleId, tour);

  const client = getSupabaseClient();
  if (client) {
    // 1. Try upserting to 'tours' table if available
    try {
      const payload = {
        id: tour.id,
        circle_id: tour.circleId,
        title: tour.title,
        destination: tour.destination,
        duration: tour.duration,
        start_date: tour.startDate || null,
        end_date: tour.endDate || null,
        estimated_budget: tour.estimatedBudget,
        allocated_from_circle: tour.allocatedFromCircle || 0,
        status: tour.status,
        banner_url: tour.bannerUrl,
        budget_breakdown: tour.budgetBreakdown,
        attending_member_ids: tour.attendingMemberIds,
        itinerary: tour.itinerary,
        documents: tour.documents,
        notes: tour.notes,
      };
      await client.from('tours').upsert(payload);
    } catch {}

    // 2. Guaranteed sync via circles.rules JSONB payload
    try {
      const { data: circleData } = await client.from('circles').select('rules').eq('id', tour.circleId).maybeSingle();
      const existingRules = Array.isArray(circleData?.rules) ? circleData.rules : [];
      const textRules = existingRules.filter((r: any) => typeof r === 'string');
      const circleTours = tours.filter((t) => t.circleId === tour.circleId);
      const updatedRules = [...textRules, { __buddyfund_tours: circleTours }];
      await client.from('circles').update({ rules: updatedRules }).eq('id', tour.circleId);
    } catch (err) {
      console.warn('Supabase backup tour sync error:', err);
    }
  }
}

export async function dbDeleteTour(tourId: string, circleId?: string): Promise<void> {
  const tours = loadLocalState<Tour[]>('tours', []);
  const target = tours.find((t) => t.id === tourId);
  const targetCircleId = circleId || target?.circleId;
  const filtered = tours.filter((t) => t.id !== tourId);
  saveLocalState('tours', filtered);

  if (targetCircleId) {
    broadcastTourDelete(targetCircleId, tourId);
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('tours').delete().eq('id', tourId);
    } catch {}

    if (targetCircleId) {
      try {
        const { data: circleData } = await client.from('circles').select('rules').eq('id', targetCircleId).maybeSingle();
        const existingRules = Array.isArray(circleData?.rules) ? circleData.rules : [];
        const textRules = existingRules.filter((r: any) => typeof r === 'string');
        const remainingTours = filtered.filter((t) => t.circleId === targetCircleId);
        const updatedRules = remainingTours.length > 0 ? [...textRules, { __buddyfund_tours: remainingTours }] : textRules;
        await client.from('circles').update({ rules: updatedRules }).eq('id', targetCircleId);
      } catch (err) {
        console.warn('Supabase backup tour delete error:', err);
      }
    }
  }
}

export function subscribeToRealtimeTours(
  circleId: string,
  onTourUpsert: (tour: Tour) => void,
  onTourRemove: (tourId: string) => void,
  onRefreshNeeded: () => void
): () => void {
  const client = getSupabaseClient();
  let supabaseChannel: any = null;

  if (client) {
    try {
      supabaseChannel = client
        .channel(`public:tours:${circleId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'circles',
            filter: `id=eq.${circleId}`,
          },
          () => {
            onRefreshNeeded();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase realtime tours subscription exception:', err);
    }
  }

  // Cross-tab broadcast channel
  let tabChannel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      tabChannel = new BroadcastChannel('buddyfund_realtime_tours');
      tabChannel.onmessage = (event) => {
        if (event.data?.type === 'TOUR_UPDATED' && event.data.circleId === circleId) {
          onTourUpsert(event.data.tour);
        } else if (event.data?.type === 'TOUR_DELETED' && event.data.circleId === circleId) {
          onTourRemove(event.data.tourId);
        }
      };
    }
  } catch {}

  // Cross-tab storage listener
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'buddyfund_data_tours' && e.newValue) {
      try {
        const parsed: Tour[] = JSON.parse(e.newValue);
        const filtered = parsed.filter((t) => t.circleId === circleId);
        if (filtered.length > 0) {
          onRefreshNeeded();
        }
      } catch {}
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    if (client && supabaseChannel) {
      client.removeChannel(supabaseChannel);
    }
    if (tabChannel) {
      tabChannel.close();
    }
    window.removeEventListener('storage', handleStorage);
  };
}
export async function dbSyncLocalToSupabase(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const localCircles = loadLocalState<Circle[]>('circles', []).filter(
      (c) => c.id !== 'circle-buddyfund-main' && c.name !== 'My BuddyFund Circle' && !isCircleDeleted(c.id)
    );

    for (const circle of localCircles) {
      await dbUpsertCircle(circle);
    }

    const localMembers = loadLocalState<CircleMember[]>('members', []).filter(
      (m) => m.circleId !== 'circle-buddyfund-main' && !isCircleDeleted(m.circleId)
    );
    for (const member of localMembers) {
      await dbUpsertMember(member);
    }

    const localTransactions = loadLocalState<Transaction[]>('transactions', []).filter(
      (t) => t.circleId !== 'circle-buddyfund-main' && !isCircleDeleted(t.circleId)
    );
    for (const tx of localTransactions) {
      await dbInsertTransaction(tx);
    }

    const localContributions = loadLocalState<ContributionRecord[]>('contributions', []).filter(
      (c) => c.circleId !== 'circle-buddyfund-main' && !isCircleDeleted(c.circleId)
    );
    for (const c of localContributions) {
      await dbUpsertContribution(c);
    }

    const localLoans = loadLocalState<Loan[]>('loans', []).filter(
      (l) => l.circleId !== 'circle-buddyfund-main' && !isCircleDeleted(l.circleId)
    );
    for (const l of localLoans) {
      await dbUpsertLoan(l);
    }

    const localVotes = loadLocalState<Vote[]>('votes', []).filter(
      (v) => v.circleId !== 'circle-buddyfund-main' && !isCircleDeleted(v.circleId)
    );
    for (const v of localVotes) {
      await dbUpsertVote(v);
    }

    const localGoals = loadLocalState<Goal[]>('goals', []).filter(
      (g) => g.circleId !== 'circle-buddyfund-main' && !isCircleDeleted(g.circleId)
    );
    for (const g of localGoals) {
      await dbUpsertGoal(g);
    }

    console.log('Supabase: Completed auto-sync from local storage to cloud database.');
  } catch (err) {
    console.warn('Supabase auto-sync exception:', err);
  }
}


