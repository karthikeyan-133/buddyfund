import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';

// Tab Views
import { DashboardTab } from './components/DashboardTab';
import { SavingsTab } from './components/SavingsTab';
import { LedgerTab } from './components/LedgerTab';
import { ExpensesTab } from './components/ExpensesTab';
import { ToursTab } from './components/ToursTab';
import { LoansTab } from './components/LoansTab';
import { MembersTab } from './components/MembersTab';
import { GoalsTab } from './components/GoalsTab';
import { VotingTab } from './components/VotingTab';
import { ReportsTab } from './components/ReportsTab';
import { AuditLogTab } from './components/AuditLogTab';
import { SuperAdminTab } from './components/SuperAdminTab';
import { MemberProfileView } from './components/MemberProfileView';

// Modals
import { CreateCircleModal } from './components/modals/CreateCircleModal';
import { EditCircleModal } from './components/modals/EditCircleModal';
import { DeleteCircleModal } from './components/modals/DeleteCircleModal';
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { RequestLoanModal } from './components/modals/RequestLoanModal';
import { AddMemberModal } from './components/modals/AddMemberModal';
import { TourProposalModal } from './components/modals/TourProposalModal';
import { AuthModal } from './components/modals/AuthModal';
import { MobileAppModal } from './components/modals/MobileAppModal';
import { AuthPage } from './components/auth/AuthPage';

// Initial Clean Data
import {
  INITIAL_USERS,
  INITIAL_CIRCLES,
  INITIAL_MEMBERS,
  INITIAL_CONTRIBUTIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_EXPENSES,
  INITIAL_TOURS,
  INITIAL_LOANS,
  INITIAL_GOALS,
  INITIAL_VOTES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './data/initialData';

import {
  dbFetchCircles,
  dbUpsertCircle,
  dbDeleteCircle,
  dbFetchMembers,
  dbUpsertMember,
  dbFetchTransactions,
  dbInsertTransaction,
  dbFetchContributions,
  dbUpsertContribution,
  subscribeToRealtimeContributions,
  broadcastContributionUpdate,
  broadcastContributionDelete,
  dbFetchExpenses,
  dbInsertExpense,
  dbUpsertExpense,
  dbDeleteExpense,
  subscribeToRealtimeExpenses,
  broadcastExpenseUpdate,
  broadcastExpenseDelete,
  subscribeToRealtimeTransactions,
  broadcastTransactionUpdate,
  dbFetchLoans,
  dbUpsertLoan,
  subscribeToRealtimeLoans,
  broadcastLoanUpdate,
  dbFetchVotes,
  dbUpsertVote,
  dbDeleteVote,
  subscribeToRealtimeVotes,
  broadcastVoteUpdate,
  broadcastVoteDelete,
  dbFetchGoals,
  dbUpsertGoal,
  dbDeleteGoal,
  subscribeToRealtimeGoals,
  broadcastGoalUpdate,
  broadcastGoalDelete,
  dbFetchTours,
  dbUpsertTour,
  dbDeleteTour,
  subscribeToRealtimeTours,
  broadcastTourUpdate,
  broadcastTourDelete,
  dbSyncLocalToSupabase,
  loadLocalState,
  saveLocalState,
} from './lib/supabase';

import {
  User,
  Circle,
  CircleMember,
  ContributionRecord,
  Transaction,
  Expense,
  Tour,
  Loan,
  LoanApprovalVote,
  Goal,
  Vote,
  VoterDetail,
  AppNotification,
  AuditLog,
  TransactionType,
  ExpenseCategory,
  LoanRepaymentMethod,
} from './types';

import { CheckCircle2, AlertCircle, X, Users, Plus } from 'lucide-react';

export default function App() {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('buddyfund_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Core Entities State (Loaded from clean store or Supabase cache, filtered of demo records)
  const [circles, setCircles] = useState<Circle[]>(() => {
    const saved = loadLocalState<Circle[]>('circles', INITIAL_CIRCLES);
    const filtered = saved.filter(
      (c) => c.id !== 'circle-buddyfund-main' && c.name !== 'My BuddyFund Circle'
    );
    if (filtered.length !== saved.length) {
      saveLocalState('circles', filtered);
    }
    return filtered;
  });
  const [currentCircleId, setCurrentCircleId] = useState<string>(() => {
    const saved = loadLocalState<Circle[]>('circles', INITIAL_CIRCLES).filter(
      (c) => c.id !== 'circle-buddyfund-main' && c.name !== 'My BuddyFund Circle'
    );
    return saved[0]?.id || '';
  });

  const [users, setUsers] = useState<User[]>(() =>
    loadLocalState<User[]>('users', INITIAL_USERS)
  );
  const [members, setMembers] = useState<CircleMember[]>(() => {
    const saved = loadLocalState<CircleMember[]>('members', INITIAL_MEMBERS);
    const filtered = saved.filter((m) => m.circleId !== 'circle-buddyfund-main');
    if (filtered.length !== saved.length) {
      saveLocalState('members', filtered);
    }
    return filtered;
  });
  const [contributions, setContributions] = useState<ContributionRecord[]>(() => {
    const saved = loadLocalState<ContributionRecord[]>('contributions', INITIAL_CONTRIBUTIONS);
    const filtered = saved.filter((c) => c.circleId !== 'circle-buddyfund-main');
    if (filtered.length !== saved.length) {
      saveLocalState('contributions', filtered);
    }
    return filtered;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = loadLocalState<Transaction[]>('transactions', INITIAL_TRANSACTIONS);
    const filtered = saved.filter((t) => t.circleId !== 'circle-buddyfund-main');
    if (filtered.length !== saved.length) {
      saveLocalState('transactions', filtered);
    }
    return filtered;
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = loadLocalState<Expense[]>('expenses', INITIAL_EXPENSES);
    const filtered = saved.filter((e) => e.circleId !== 'circle-buddyfund-main');
    if (filtered.length !== saved.length) {
      saveLocalState('expenses', filtered);
    }
    return filtered;
  });
  const [tours, setTours] = useState<Tour[]>(() => {
    const saved = loadLocalState<Tour[]>('tours', INITIAL_TOURS);
    const filtered = saved.filter((t) => t.circleId !== 'circle-buddyfund-main');
    if (filtered.length !== saved.length) {
      saveLocalState('tours', filtered);
    }
    return filtered;
  });
  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = loadLocalState<Loan[]>('loans', INITIAL_LOANS);
    const filtered = saved.filter((l) => l.circleId !== 'circle-buddyfund-main');
    if (filtered.length !== saved.length) {
      saveLocalState('loans', filtered);
    }
    return filtered;
  });
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = loadLocalState<Goal[]>('goals', INITIAL_GOALS);
    const filtered = saved.filter((g) => g.circleId !== 'circle-buddyfund-main');
    if (filtered.length !== saved.length) {
      saveLocalState('goals', filtered);
    }
    return filtered;
  });
  const [votes, setVotes] = useState<Vote[]>(() => {
    const saved = loadLocalState<Vote[]>('votes', INITIAL_VOTES);
    const filtered = saved.filter((v) => v.circleId !== 'circle-buddyfund-main');
    if (filtered.length !== saved.length) {
      saveLocalState('votes', filtered);
    }
    return filtered;
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = loadLocalState<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
    const filtered = saved.filter((a) => a.circleId !== 'circle-buddyfund-main');
    if (filtered.length !== saved.length) {
      saveLocalState('audit_logs', filtered);
    }
    return filtered;
  });

  // Active Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);

  // Auto-redirect members away from restricted tabs
  useEffect(() => {
    if (currentUser?.role === 'member' && ['ledger', 'reports', 'audit'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [currentUser?.role, activeTab]);

  const handleNavigateTab = (tab: string) => {
    if (currentUser?.role === 'member' && ['ledger', 'reports', 'audit'].includes(tab)) {
      showToast('This section is restricted to Circle Admins.');
      setActiveTab('dashboard');
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modals state
  const [isCreateCircleOpen, setIsCreateCircleOpen] = useState(false);
  const [circleToEdit, setCircleToEdit] = useState<Circle | null>(null);
  const [circleToDelete, setCircleToDelete] = useState<Circle | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isRequestLoanOpen, setIsRequestLoanOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isTourProposalOpen, setIsTourProposalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileAppModalOpen, setIsMobileAppModalOpen] = useState(false);
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<string | undefined>(undefined);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Currently Selected Circle
  const currentCircle =
    circles.find((c) => c.id === currentCircleId) || circles[0] || null;

  // Circle-filtered entities
  const circleMembers = currentCircle ? members.filter((m) => m.circleId === currentCircle.id) : [];
  const circleContributions = currentCircle ? contributions.filter((c) => c.circleId === currentCircle.id) : [];
  const circleTransactions = currentCircle ? transactions.filter((t) => t.circleId === currentCircle.id) : [];
  const circleExpenses = currentCircle ? expenses.filter((e) => e.circleId === currentCircle.id) : [];
  const circleTours = currentCircle ? tours.filter((t) => t.circleId === currentCircle.id) : [];
  const circleLoans = currentCircle ? loans.filter((l) => l.circleId === currentCircle.id) : [];
  const circleGoals = currentCircle ? goals.filter((g) => g.circleId === currentCircle.id) : [];
  const circleVotes = currentCircle ? votes.filter((v) => v.circleId === currentCircle.id) : [];
  const circleAuditLogs = currentCircle ? auditLogs.filter((a) => a.circleId === currentCircle.id) : [];

  // Live Wallet & Financial Computations (Calculated dynamically from real transactions)
  const totalContributions = circleTransactions
    .filter((t) => t.type === 'CONTRIBUTION')
    .reduce((sum, t) => sum + t.amount, 0);

  const txExpenseTotal = circleTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
  const expTableTotal = circleExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = Math.max(txExpenseTotal, expTableTotal);

  const txTourExpenses = circleTransactions
    .filter((t) => t.type === 'EXPENSE' && (t.category === 'Tour' || t.category === 'Hotel' || t.category === 'Travel'))
    .reduce((sum, t) => sum + t.amount, 0);
  const expTourExpenses = circleExpenses
    .filter((e) => (e.category as any) === 'Tour' || e.category === 'Hotel' || e.category === 'Travel')
    .reduce((sum, e) => sum + e.amount, 0);
  const tourExpenses = Math.max(txTourExpenses, expTourExpenses);

  const txFoodExpenses = circleTransactions
    .filter((t) => t.type === 'EXPENSE' && t.category === 'Food')
    .reduce((sum, t) => sum + t.amount, 0);
  const expFoodExpenses = circleExpenses
    .filter((e) => e.category === 'Food')
    .reduce((sum, e) => sum + e.amount, 0);
  const foodExpenses = Math.max(txFoodExpenses, expFoodExpenses);

  const loansGiven = circleTransactions
    .filter((t) => t.type === 'LOAN_DISBURSEMENT')
    .reduce((sum, t) => sum + t.amount, 0);

  const loansPrincipalRepaid = circleTransactions
    .filter((t) => t.type === 'LOAN_PRINCIPAL_REPAYMENT')
    .reduce((sum, t) => sum + t.amount, 0);

  const interestEarned = circleTransactions
    .filter((t) => t.type === 'INTEREST_PAYMENT')
    .reduce((sum, t) => sum + t.amount, 0);

  // Double-entry formula: Fund Balance = Contributions + Principal Repaid + Interest Earned - Expenses - Loans Disbursed
  const currentBalance = Math.max(
    0,
    totalContributions + loansPrincipalRepaid + interestEarned - totalExpenses - loansGiven
  );

  const activeLoanOutstanding = circleLoans
    .filter((l) => l.status === 'Active')
    .reduce((sum, l) => sum + l.remainingAmount, 0);

  const activeLoanCount = circleLoans.filter((l) => l.status === 'Active').length;

  const wallet = {
    currentBalance,
    totalContributions,
    totalExpenses,
    tourExpenses,
    foodExpenses,
    loansGiven,
    loansPrincipalRepaid,
    interestEarned,
    activeLoanOutstanding,
    activeLoanCount,
  };

  // Current Week Stats - dynamically calculated from actual contributions
  const currentWeekRecords = circleContributions.filter((c) => c.weekNumber === 1);
  const paidCount = currentWeekRecords.filter((c) => c.status === 'Paid').length;
  const pendingCount = Math.max(0, circleMembers.length - paidCount);

  const currentWeekStats = {
    weekLabel: 'Week 1',
    paidCount,
    pendingCount,
    totalExpected: circleMembers.length * (currentCircle?.contributionAmount || 0),
  };

  // Weekly Trend Chart Data - dynamically computed from actual contributions
  const weeklyChartData = [1, 2, 3, 4, 5].map((wk) => {
    const collected = circleContributions
      .filter((c) => c.weekNumber === wk && c.status === 'Paid')
      .reduce((sum, c) => sum + (c.paidAmount || c.amount || 0), 0);
    const target = circleMembers.length * (currentCircle?.contributionAmount || 0);
    return { name: `Wk ${wk}`, collected, target };
  });

  // Expense breakdown chart data - dynamically grouped from actual expenses
  const expenseCategoriesMap: Record<string, number> = {};
  circleExpenses.forEach((exp) => {
    const cat = exp.category || 'Other';
    expenseCategoriesMap[cat] = (expenseCategoriesMap[cat] || 0) + exp.amount;
  });
  const expenseChartData = Object.entries(expenseCategoriesMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Upcoming Tour
  const upcomingTour = circleTours[0] || null;

  // Supabase & Cloud Database Sync
  useEffect(() => {
    dbFetchCircles().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setCircles(fetched);
        if (!fetched.some((c) => c.id === currentCircleId)) {
          setCurrentCircleId(fetched[0].id);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!currentCircleId) return;
    dbFetchMembers(currentCircleId).then((m) => {
      if (m && m.length > 0) {
        setMembers((prev) => [...m, ...prev.filter((x) => x.circleId !== currentCircleId)]);
      }
    });
    dbFetchContributions(currentCircleId).then((c) => {
      if (c && c.length > 0) {
        setContributions((prev) => [...c, ...prev.filter((x) => x.circleId !== currentCircleId)]);
      }
    });
    dbFetchTransactions(currentCircleId).then((t) => {
      if (t && t.length > 0) {
        setTransactions((prev) => [...t, ...prev.filter((x) => x.circleId !== currentCircleId)]);
      }
    });
    dbFetchExpenses(currentCircleId).then((e) => {
      if (e && e.length > 0) {
        setExpenses((prev) => [...e, ...prev.filter((x) => x.circleId !== currentCircleId)]);
      }
    });
    dbFetchLoans(currentCircleId).then((l) => {
      if (l && l.length > 0) {
        setLoans((prev) => [...l, ...prev.filter((x) => x.circleId !== currentCircleId)]);
      }
    });
    dbFetchVotes(currentCircleId).then((v) => {
      if (v) {
        setVotes((prev) => [...v, ...prev.filter((x) => x.circleId !== currentCircleId)]);
      }
    });
    dbFetchGoals(currentCircleId).then((g) => {
      if (g) {
        setGoals((prev) => [...g, ...prev.filter((x) => x.circleId !== currentCircleId)]);
      }
    });
    dbFetchTours(currentCircleId).then((t) => {
      if (t && t.length > 0) {
        setTours((prev) => [...t, ...prev.filter((x) => x.circleId !== currentCircleId)]);
      }
    });
  }, [currentCircleId]);

  // Realtime Live Synchronization for Decision Polls and Loans (Instant cross-tab, cross-device & polling)
  useEffect(() => {
    if (!currentCircleId) return;

    // 1. WebSocket & Cross-Tab Realtime Listener for Votes
    const unsubscribeVotes = subscribeToRealtimeVotes(
      currentCircleId,
      (updatedVote) => {
        setVotes((prev) => {
          const exists = prev.some((v) => v.id === updatedVote.id);
          const next = exists
            ? prev.map((v) => (v.id === updatedVote.id ? updatedVote : v))
            : [updatedVote, ...prev];
          saveLocalState('votes', next);
          return next;
        });
      },
      (deletedVoteId) => {
        setVotes((prev) => {
          const next = prev.filter((v) => v.id !== deletedVoteId);
          saveLocalState('votes', next);
          return next;
        });
      },
      () => {
        dbFetchVotes(currentCircleId).then((v) => {
          if (v) {
            setVotes((prev) => [...v, ...prev.filter((x) => x.circleId !== currentCircleId)]);
          }
        });
      }
    );

    // 2. WebSocket & Cross-Tab Realtime Listener for Loans
    const unsubscribeLoans = subscribeToRealtimeLoans(
      currentCircleId,
      (updatedLoan) => {
        setLoans((prev) => {
          const exists = prev.some((l) => l.id === updatedLoan.id);
          const next = exists
            ? prev.map((l) => (l.id === updatedLoan.id ? updatedLoan : l))
            : [updatedLoan, ...prev];
          saveLocalState('loans', next);
          return next;
        });
      },
      () => {
        dbFetchLoans(currentCircleId).then((l) => {
          if (l) {
            setLoans((prev) => [...l, ...prev.filter((x) => x.circleId !== currentCircleId)]);
          }
        });
      }
    );

    // 3. WebSocket & Cross-Tab Realtime Listener for Goals
    const unsubscribeGoals = subscribeToRealtimeGoals(
      currentCircleId,
      (updatedGoal) => {
        setGoals((prev) => {
          const exists = prev.some((g) => g.id === updatedGoal.id);
          const next = exists
            ? prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g))
            : [updatedGoal, ...prev];
          saveLocalState('goals', next);
          return next;
        });
      },
      (deletedGoalId) => {
        setGoals((prev) => {
          const next = prev.filter((g) => g.id !== deletedGoalId);
          saveLocalState('goals', next);
          return next;
        });
      },
      () => {
        dbFetchGoals(currentCircleId).then((latestGoals) => {
          if (latestGoals) {
            setGoals((prev) => {
              const currentGoals = prev.filter((g) => g.circleId === currentCircleId);
              if (JSON.stringify(currentGoals) !== JSON.stringify(latestGoals)) {
                const others = prev.filter((g) => g.circleId !== currentCircleId);
                const next = [...latestGoals, ...others];
                saveLocalState('goals', next);
                return next;
              }
              return prev;
            });
          }
        });
      }
    );

    // 4. WebSocket & Cross-Tab Realtime Listener for Contributions
    const unsubscribeContributions = subscribeToRealtimeContributions(
      currentCircleId,
      (updatedRecord) => {
        setContributions((prev) => {
          const filtered = prev.filter(
            (c) =>
              c.id !== updatedRecord.id &&
              !(
                c.circleId === updatedRecord.circleId &&
                c.userId === updatedRecord.userId &&
                c.dueDate === updatedRecord.dueDate
              )
          );
          const next = [updatedRecord, ...filtered];
          saveLocalState('contributions', next);
          return next;
        });
      },
      (deletedRecordId) => {
        setContributions((prev) => {
          const next = prev.filter((c) => c.id !== deletedRecordId);
          saveLocalState('contributions', next);
          return next;
        });
      },
      (latestRecords) => {
        if (latestRecords && Array.isArray(latestRecords) && latestRecords.length > 0) {
          setContributions((prev) => {
            const others = prev.filter((c) => c.circleId !== currentCircleId);
            return [...latestRecords, ...others];
          });
        } else {
          dbFetchContributions(currentCircleId)
            .then((latest) => {
              if (latest && Array.isArray(latest)) {
                setContributions((prev) => {
                  const others = prev.filter((c) => c.circleId !== currentCircleId);
                  return [...latest, ...others];
                });
              }
            })
            .catch(() => {});
        }
      }
    );

    // 5. WebSocket & Cross-Tab Realtime Listener for Tours
    const unsubscribeTours = subscribeToRealtimeTours(
      currentCircleId,
      (updatedTour) => {
        setTours((prev) => {
          const exists = prev.some((t) => t.id === updatedTour.id);
          const next = exists
            ? prev.map((t) => (t.id === updatedTour.id ? updatedTour : t))
            : [updatedTour, ...prev];
          saveLocalState('tours', next);
          return next;
        });
      },
      (deletedTourId) => {
        setTours((prev) => {
          const next = prev.filter((t) => t.id !== deletedTourId);
          saveLocalState('tours', next);
          return next;
        });
      },
      () => {
        dbFetchTours(currentCircleId).then((latestTours) => {
          if (latestTours && latestTours.length > 0) {
            setTours((prev) => [...latestTours, ...prev.filter((x) => x.circleId !== currentCircleId)]);
          }
        });
      }
    );

    // 6. WebSocket & Cross-Tab Realtime Listener for Expenses
    const unsubscribeExpenses = subscribeToRealtimeExpenses(
      currentCircleId,
      (updatedExpense) => {
        setExpenses((prev) => {
          const exists = prev.some((e) => e.id === updatedExpense.id);
          const next = exists
            ? prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
            : [updatedExpense, ...prev];
          saveLocalState('expenses', next);
          return next;
        });
      },
      (deletedExpenseId) => {
        setExpenses((prev) => {
          const next = prev.filter((e) => e.id !== deletedExpenseId);
          saveLocalState('expenses', next);
          return next;
        });
      },
      () => {
        dbFetchExpenses(currentCircleId).then((latestExpenses) => {
          if (latestExpenses && Array.isArray(latestExpenses)) {
            setExpenses((prev) => {
              const others = prev.filter((e) => e.circleId !== currentCircleId);
              const next = [...latestExpenses, ...others];
              saveLocalState('expenses', next);
              return next;
            });
          }
        });
      }
    );

    // 7. WebSocket & Cross-Tab Realtime Listener for Ledger Transactions
    const unsubscribeTransactions = subscribeToRealtimeTransactions(
      currentCircleId,
      (updatedTx) => {
        setTransactions((prev) => {
          const exists = prev.some((t) => t.id === updatedTx.id);
          const next = exists
            ? prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
            : [updatedTx, ...prev];
          saveLocalState('transactions', next);
          return next;
        });
      },
      () => {
        dbFetchTransactions(currentCircleId).then((latestTxs) => {
          if (latestTxs && Array.isArray(latestTxs)) {
            setTransactions((prev) => {
              const others = prev.filter((t) => t.circleId !== currentCircleId);
              const next = [...latestTxs, ...others];
              saveLocalState('transactions', next);
              return next;
            });
          }
        });
      }
    );

    // 8. High-Frequency Polling Loop:
    // Poll every 1.5 seconds to guarantee instant sync across tabs and member devices without manual refresh
    const pollInterval = setInterval(() => {
      dbFetchVotes(currentCircleId)
        .then((latest) => {
          if (latest) {
            setVotes((prev) => {
              const currentCircleList = prev.filter((v) => v.circleId === currentCircleId);
              if (JSON.stringify(currentCircleList) !== JSON.stringify(latest)) {
                const others = prev.filter((v) => v.circleId !== currentCircleId);
                return [...latest, ...others];
              }
              return prev;
            });
          }
        })
        .catch(() => {});

      if (activeTab === 'loans') {
        dbFetchLoans(currentCircleId)
          .then((latestLoans) => {
            if (latestLoans) {
              setLoans((prev) => {
                const currentLoans = prev.filter((l) => l.circleId === currentCircleId);
                if (JSON.stringify(currentLoans) !== JSON.stringify(latestLoans)) {
                  const others = prev.filter((l) => l.circleId !== currentCircleId);
                  return [...latestLoans, ...others];
                }
                return prev;
              });
            }
          })
          .catch(() => {});
      }

      // Always poll goals so members receive admin-added goals immediately
      dbFetchGoals(currentCircleId)
        .then((latestGoals) => {
          if (latestGoals) {
            setGoals((prev) => {
              const currentGoals = prev.filter((g) => g.circleId === currentCircleId);
              if (JSON.stringify(currentGoals) !== JSON.stringify(latestGoals)) {
                const others = prev.filter((g) => g.circleId !== currentCircleId);
                const next = [...latestGoals, ...others];
                saveLocalState('goals', next);
                return next;
              }
              return prev;
            });
          }
        })
        .catch(() => {});

      // Poll tours so members receive admin-created tour proposals immediately without refresh
      dbFetchTours(currentCircleId)
        .then((latestTours) => {
          if (latestTours && Array.isArray(latestTours)) {
            setTours((prev) => {
              const currentTours = prev.filter((t) => t.circleId === currentCircleId);
              const isDifferent =
                currentTours.length !== latestTours.length ||
                latestTours.some((lt) => {
                  const existing = currentTours.find((t) => t.id === lt.id);
                  return (
                    !existing ||
                    existing.title !== lt.title ||
                    existing.destination !== lt.destination ||
                    existing.estimatedBudget !== lt.estimatedBudget ||
                    existing.status !== lt.status ||
                    existing.attendingMemberIds.length !== lt.attendingMemberIds.length
                  );
                });
              if (isDifferent) {
                const others = prev.filter((t) => t.circleId !== currentCircleId);
                const next = [...latestTours, ...others];
                saveLocalState('tours', next);
                return next;
              }
              return prev;
            });
          }
        })
        .catch(() => {});

      // Poll expenses so members receive new expenses immediately without manual refresh
      dbFetchExpenses(currentCircleId)
        .then((latestExpenses) => {
          if (latestExpenses && Array.isArray(latestExpenses)) {
            setExpenses((prev) => {
              const currentExpenses = prev.filter((e) => e.circleId === currentCircleId);
              const isDifferent =
                currentExpenses.length !== latestExpenses.length ||
                latestExpenses.some((le) => {
                  const cur = currentExpenses.find((e) => e.id === le.id);
                  return (
                    !cur ||
                    cur.amount !== le.amount ||
                    cur.title !== le.title ||
                    cur.category !== le.category ||
                    cur.paidBy !== le.paidBy
                  );
                });
              if (isDifferent) {
                const others = prev.filter((e) => e.circleId !== currentCircleId);
                const next = [...latestExpenses, ...others];
                saveLocalState('expenses', next);
                return next;
              }
              return prev;
            });
          }
        })
        .catch(() => {});

      // Poll contributions so member payment records update in real time without refreshing
      dbFetchContributions(currentCircleId)
        .then((latestContribs) => {
          if (latestContribs && Array.isArray(latestContribs)) {
            setContributions((prev) => {
              const currentCircleContribs = prev.filter((c) => c.circleId === currentCircleId);
              const isDifferent =
                currentCircleContribs.length !== latestContribs.length ||
                latestContribs.some((latest) => {
                  const cur = currentCircleContribs.find((c) => c.id === latest.id);
                  return (
                    !cur ||
                    cur.status !== latest.status ||
                    cur.paidAmount !== latest.paidAmount ||
                    cur.dueDate !== latest.dueDate ||
                    cur.referenceNote !== latest.referenceNote ||
                    cur.paymentMethod !== latest.paymentMethod
                  );
                });
              if (isDifferent) {
                const others = prev.filter((c) => c.circleId !== currentCircleId);
                const next = [...latestContribs, ...others];
                saveLocalState('contributions', next);
                return next;
              }
              return prev;
            });
          }
        })
        .catch(() => {});

      // Poll transactions so Dashboard metrics (Current Fund, Total Expenses) update live on all tabs
      dbFetchTransactions(currentCircleId)
        .then((latestTx) => {
          if (latestTx && Array.isArray(latestTx)) {
            setTransactions((prev) => {
              const currentTxs = prev.filter((t) => t.circleId === currentCircleId);
              const isDifferent =
                currentTxs.length !== latestTx.length ||
                latestTx.some((lt) => {
                  const existing = currentTxs.find((t) => t.id === lt.id);
                  return !existing || existing.memberName !== lt.memberName || existing.amount !== lt.amount;
                });
              if (isDifferent) {
                const others = prev.filter((t) => t.circleId !== currentCircleId);
                const next = [...latestTx, ...others];
                saveLocalState('transactions', next);
                return next;
              }
              return prev;
            });
          }
        })
        .catch(() => {});

      if (activeTab === 'profile') {
        dbFetchMembers(currentCircleId)
          .then((latestMembers) => {
            if (latestMembers && Array.isArray(latestMembers) && latestMembers.length > 0) {
              setMembers((prev) => {
                const others = prev.filter((m) => m.circleId !== currentCircleId);
                return [...latestMembers, ...others];
              });
            }
          })
          .catch(() => {});
      }
    }, 1500);

    return () => {
      unsubscribeVotes();
      unsubscribeLoans();
      unsubscribeGoals();
      unsubscribeContributions();
      unsubscribeTours();
      unsubscribeExpenses();
      unsubscribeTransactions();
      clearInterval(pollInterval);
    };
  }, [currentCircleId, activeTab]);

  // Authentication Handlers
  const handleLoginAsAdmin = (circleId: string, adminUser: User) => {
    setCurrentCircleId(circleId);
    setCurrentUser(adminUser);
    try {
      localStorage.setItem('buddyfund_current_user', JSON.stringify(adminUser));
    } catch {}
    showToast('Welcome, Circle Admin! Full management access granted.');
  };

  const handleLoginAsMember = (circleId: string, memberUser: User) => {
    setCurrentCircleId(circleId);
    setCurrentUser(memberUser);
    try {
      localStorage.setItem('buddyfund_current_user', JSON.stringify(memberUser));
    } catch {}
    setActiveTab('dashboard');
    showToast(`Welcome, ${memberUser.name}! Signed in as Squad Member.`);
  };

  const handleCreateCircleAndLogin = (circleData: {
    name: string;
    description: string;
    contributionAmount: number;
    contributionFrequency: 'weekly' | 'monthly';
    contributionDay: string;
    adminSecretCode: string;
    adminName?: string;
    adminPhotoUrl?: string;
  }) => {
    const newCircleId = `circle-${Date.now()}`;
    const adminName = circleData.adminName?.trim() || 'Circle Admin';
    const adminPhotoUrl =
      circleData.adminPhotoUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const newCircle: Circle = {
      id: newCircleId,
      name: circleData.name,
      description: circleData.description,
      photoUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
      currency: 'INR',
      currencySymbol: '₹',
      contributionFrequency: circleData.contributionFrequency,
      contributionAmount: circleData.contributionAmount,
      contributionDay: circleData.contributionDay,
      startDate: new Date().toISOString().split('T')[0],
      expectedMembers: 10,
      rules: [
        `Every member contributes ₹${circleData.contributionAmount} ${circleData.contributionFrequency} on ${circleData.contributionDay}.`,
      ],
      createdBy: adminName,
      createdAt: new Date().toISOString(),
      planTier: 'free',
      inviteCode: `BUDDY-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      adminSecretCode: circleData.adminSecretCode,
      adminName: adminName,
      adminPhotoUrl: adminPhotoUrl,
    };

    setCircles((prev) => [newCircle, ...prev]);
    setCurrentCircleId(newCircleId);
    dbUpsertCircle(newCircle);

    const adminUserId = `admin-${newCircleId}`;
    const adminUser: User = {
      id: adminUserId,
      name: adminName,
      email: 'admin@buddyfund.local',
      phone: '+91 98401 00000',
      avatarUrl: adminPhotoUrl,
      role: 'circle_admin',
      joinedDate: new Date().toISOString().split('T')[0],
      circleIds: [newCircleId],
      isVerified: true,
      status: 'active',
    };

    // Register admin in members directory for this circle
    const adminMember: CircleMember = {
      id: `member-${adminUserId}`,
      userId: adminUserId,
      circleId: newCircleId,
      name: adminName,
      email: 'admin@buddyfund.local',
      phone: '+91 98401 00000',
      avatarUrl: adminPhotoUrl,
      role: 'circle_admin',
      joinedDate: new Date().toISOString().split('T')[0],
      totalContributed: 0,
      totalReceived: 0,
      pendingContribution: 0,
      outstandingLoan: 0,
      loanRepaymentStatus: 'none',
    };

    setMembers((prev) => [adminMember, ...prev]);
    dbUpsertMember(adminMember);

    setUsers((prev) => {
      const filtered = prev.filter((u) => u.id !== adminUserId);
      return [adminUser, ...filtered];
    });

    setCurrentUser(adminUser);
    try {
      localStorage.setItem('buddyfund_current_user', JSON.stringify(adminUser));
    } catch {}
    showToast(`Circle "${circleData.name}" created! Welcome, ${adminName}.`);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('buddyfund_current_user');
    } catch {}
    showToast('Signed out of Ithanu_njangal.');
  };

  // Handlers for User & Circle Switching
  const handleSelectCircle = (circleId: string) => {
    setCurrentCircleId(circleId);
    showToast(`Switched to circle "${circles.find((c) => c.id === circleId)?.name}"`);
  };

  const handleSwitchUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      try {
        localStorage.setItem('buddyfund_current_user', JSON.stringify(targetUser));
      } catch {}
      showToast(`Logged in as ${targetUser.name} (${targetUser.role.replace('_', ' ')})`);
    }
  };

  // Notification handlers
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read');
  };

  // Actions: Record Payment
  const handleRecordPayment = (data: {
    recordId?: string;
    userId: string;
    date?: string;
    weekNumber?: number;
    amount: number;
    paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
    referenceNote: string;
    status: 'Paid' | 'Partially Paid' | 'Waived';
  }) => {
    if (!currentUser) return;
    if (currentUser.role === 'member') {
      showToast('Permission denied: Only Circle Admins can record payments.');
      return;
    }

    const member =
      members.find((m) => m.userId === data.userId || m.id === data.userId) ||
      users.find((u) => u.id === data.userId);
    const memberName =
      member?.name ||
      (data.userId === currentUser.id ? currentUser.name : '') ||
      'Member';

    const dateStr = data.date || new Date().toISOString().split('T')[0];
    const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const targetId =
      data.recordId ||
      `contrib-${currentCircle.id}-${data.userId}-${dateStr.replace(/-/g, '')}`;

    // 1. Prepare contribution record
    const existing = data.recordId
      ? contributions.find((c) => c.id === data.recordId)
      : contributions.find(
          (c) =>
            c.circleId === currentCircle.id &&
            (c.userId === data.userId || (member && c.userId === member.userId)) &&
            (c.dueDate === dateStr || (data.weekNumber && c.weekNumber === data.weekNumber))
        );

    const recordToSave: ContributionRecord = existing
      ? {
          ...existing,
          userName: memberName,
          amount: data.amount,
          paidAmount: data.amount,
          status: data.status,
          paymentMethod: data.paymentMethod,
          referenceNote: data.referenceNote,
          dueDate: dateStr,
          paidDate: dateStr,
          weekLabel: formattedDate,
          recordedBy: currentUser.name,
        }
      : {
          id: targetId,
          circleId: currentCircle.id,
          userId: data.userId,
          userName: memberName,
          weekNumber: data.weekNumber || 1,
          weekLabel: formattedDate,
          dueDate: dateStr,
          amount: data.amount,
          paidAmount: data.amount,
          status: data.status,
          paidDate: dateStr,
          paymentMethod: data.paymentMethod,
          referenceNote: data.referenceNote,
          recordedBy: currentUser.name,
        };

    // Update state & storage
    setContributions((prev) => {
      const filtered = prev.filter(
        (c) =>
          c.id !== recordToSave.id &&
          !(
            c.circleId === currentCircle.id &&
            (c.userId === data.userId || (member && c.userId === member.userId)) &&
            c.dueDate === dateStr
          )
      );
      const next = [recordToSave, ...filtered];
      saveLocalState('contributions', next);
      return next;
    });

    // Persist to Supabase database
    dbUpsertContribution(recordToSave);

    // Instant real-time broadcast across all tabs and devices
    broadcastContributionUpdate(currentCircle.id, recordToSave);

    // 2. Append to double-entry Transaction Ledger (deduplicated by reference)
    const txRef = `SAV-${currentCircle.id.slice(-4)}-${data.userId.slice(-6)}-${dateStr.replace(/-/g, '')}`;
    const newTx: Transaction = {
      id: `tx-${currentCircle.id.slice(-4)}-${data.userId.slice(-6)}-${dateStr.replace(/-/g, '')}`,
      circleId: currentCircle.id,
      memberId: data.userId,
      memberName: memberName,
      amount: data.amount,
      type: 'CONTRIBUTION',
      category: 'Savings Contribution',
      date: new Date().toISOString(),
      reference: txRef,
      createdBy: currentUser.name,
      notes: `Savings contribution (${formattedDate}) via ${data.paymentMethod}`,
      auditInfo: `Recorded by ${currentUser.name}`,
    };
    setTransactions((prev) => {
      const exists = prev.some((t) => t.reference === txRef || t.id === newTx.id);
      if (exists) {
        const next = prev.map((t) => (t.reference === txRef || t.id === newTx.id ? newTx : t));
        saveLocalState('transactions', next);
        return next;
      }
      dbInsertTransaction(newTx);
      const next = [newTx, ...prev];
      saveLocalState('transactions', next);
      return next;
    });

    // 3. Append to Audit Trail
    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      circleId: currentCircle.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Payment Recorded',
      timestamp: new Date().toISOString(),
      oldValue: 'Status: Pending',
      newValue: `Status: ${data.status} (₹${data.amount} for ${memberName})`,
      ipInfo: '103.14.88.2 (Palakkad, IN)',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    // 4. Update member's stats
    setMembers((prev) =>
      prev.map((m) =>
        (m.userId === data.userId || m.id === data.userId) && m.circleId === currentCircle.id
          ? { ...m, totalContributed: m.totalContributed + data.amount, pendingContribution: Math.max(0, m.pendingContribution - data.amount) }
          : m
      )
    );

    showToast(`Payment of ₹${data.amount} recorded for ${memberName}`);
  };

  // Actions: Member Submits Weekly Savings Payment for Admin Verification
  const handleMemberSubmitSavingsPayment = (data: {
    recordId: string;
    userId: string;
    amount: number;
    paymentMethod: 'UPI' | 'Cash' | 'Bank Transfer';
    referenceNote: string;
    date: string;
  }) => {
    if (!currentUser) return;

    const member =
      members.find((m) => m.userId === data.userId || m.id === data.userId) ||
      users.find((u) => u.id === data.userId);
    const memberName = member?.name || currentUser.name || 'Member';
    const dateStr = data.date || new Date().toISOString().split('T')[0];
    const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const targetId =
      data.recordId && !data.recordId.startsWith('sched-')
        ? data.recordId
        : `contrib-${currentCircle.id}-${data.userId}-${dateStr.replace(/-/g, '')}`;

    const existing = contributions.find((c) => c.id === targetId || c.id === data.recordId);

    const recordToSave: ContributionRecord = {
      id: targetId,
      circleId: currentCircle.id,
      userId: data.userId,
      userName: memberName,
      weekNumber: existing?.weekNumber || 1,
      weekLabel: existing?.weekLabel || formattedDate,
      dueDate: existing?.dueDate || dateStr,
      amount: data.amount,
      paidAmount: 0, // Crucial: Fund balance does NOT update until Circle Admin explicitly confirms!
      status: 'Pending Confirmation',
      paidDate: dateStr,
      paymentMethod: data.paymentMethod,
      referenceNote: data.referenceNote,
      submittedAt: new Date().toISOString(),
      recordedBy: `${currentUser.name} (Claimed)`,
    };

    // Update state & storage
    setContributions((prev) => {
      const filtered = prev.filter(
        (c) =>
          c.id !== recordToSave.id &&
          !(
            c.circleId === currentCircle.id &&
            c.userId === data.userId &&
            c.dueDate === recordToSave.dueDate
          )
      );
      const next = [recordToSave, ...filtered];
      saveLocalState('contributions', next);
      return next;
    });

    dbUpsertContribution(recordToSave);
    broadcastContributionUpdate(currentCircle.id, recordToSave);

    // Notify Circle Admin
    const adminMembers = circleMembers.filter((m) => m.role === 'circle_admin');
    const adminNotification: AppNotification = {
      id: `notif-claim-${Date.now()}`,
      circleId: currentCircle.id,
      userId: adminMembers[0]?.userId || 'admin',
      title: 'Savings Payment Confirmation Request',
      message: `${memberName} submitted ₹${data.amount} via ${data.paymentMethod} (${data.referenceNote}). Please confirm if payment is received.`,
      type: 'payment_received',
      date: new Date().toISOString(),
      isRead: false,
      linkToTab: 'savings',
    };
    setNotifications((prev) => [adminNotification, ...prev]);

    // Audit Log
    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      circleId: currentCircle.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Payment Submitted by Member',
      timestamp: new Date().toISOString(),
      oldValue: 'Status: Pending',
      newValue: `Status: Pending Confirmation (₹${data.amount} via ${data.paymentMethod} by ${memberName})`,
      ipInfo: '103.14.88.2 (Palakkad, IN)',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(`Payment of ₹${data.amount} submitted! Awaiting Circle Admin confirmation.`);
  };

  // Actions: Circle Admin Confirms Savings Payment ("Payment Received / Get")
  const handleAdminConfirmSavingsPayment = (record: ContributionRecord) => {
    if (!currentUser) return;
    if (currentUser.role === 'member') {
      showToast('Permission denied: Only Circle Admins can confirm payments.');
      return;
    }

    const member =
      members.find((m) => m.userId === record.userId || m.id === record.userId) ||
      users.find((u) => u.id === record.userId);
    const memberName = member?.name || record.userName || 'Member';
    const dateStr = record.dueDate || new Date().toISOString().split('T')[0];
    const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const confirmedRecord: ContributionRecord = {
      ...record,
      userName: memberName,
      paidAmount: record.amount,
      status: 'Paid',
      paidDate: new Date().toISOString().split('T')[0],
      recordedBy: currentUser.name,
      adminDecisionDate: new Date().toISOString(),
    };

    // 1. Update Contribution Record
    setContributions((prev) => {
      const filtered = prev.filter(
        (c) =>
          c.id !== confirmedRecord.id &&
          !(
            c.circleId === currentCircle.id &&
            c.userId === record.userId &&
            c.dueDate === record.dueDate
          )
      );
      const next = [confirmedRecord, ...filtered];
      saveLocalState('contributions', next);
      return next;
    });

    dbUpsertContribution(confirmedRecord);
    broadcastContributionUpdate(currentCircle.id, confirmedRecord);

    // 2. Double-entry Transaction Ledger (Now and ONLY now does the circle fund update!)
    const txRef = `SAV-${currentCircle.id.slice(-4)}-${record.userId.slice(-6)}-${dateStr.replace(/-/g, '')}`;
    const newTx: Transaction = {
      id: `tx-${currentCircle.id.slice(-4)}-${record.userId.slice(-6)}-${dateStr.replace(/-/g, '')}`,
      circleId: currentCircle.id,
      memberId: record.userId,
      memberName: memberName,
      amount: record.amount,
      type: 'CONTRIBUTION',
      category: 'Savings Contribution',
      date: new Date().toISOString(),
      reference: txRef,
      createdBy: currentUser.name,
      notes: `Savings contribution (${formattedDate}) confirmed via ${record.paymentMethod || 'UPI'} • ${record.referenceNote || 'Verified by Admin'}`,
      auditInfo: `Confirmed by Circle Admin ${currentUser.name}`,
    };

    setTransactions((prev) => {
      const exists = prev.some((t) => t.reference === txRef || t.id === newTx.id);
      if (exists) {
        const next = prev.map((t) => (t.reference === txRef || t.id === newTx.id ? newTx : t));
        saveLocalState('transactions', next);
        return next;
      }
      dbInsertTransaction(newTx);
      const next = [newTx, ...prev];
      saveLocalState('transactions', next);
      return next;
    });

    // 3. Update member's stats
    setMembers((prev) =>
      prev.map((m) =>
        (m.userId === record.userId || m.id === record.userId) && m.circleId === currentCircle.id
          ? {
              ...m,
              totalContributed: m.totalContributed + record.amount,
              pendingContribution: Math.max(0, m.pendingContribution - record.amount),
            }
          : m
      )
    );

    // 4. Notify the Member
    const memberNotification: AppNotification = {
      id: `notif-conf-${Date.now()}`,
      circleId: currentCircle.id,
      userId: record.userId,
      title: 'Savings Payment Confirmed! ✅',
      message: `Circle Admin ${currentUser.name} confirmed your payment of ₹${record.amount} for ${record.dueDate || formattedDate}. Fund updated!`,
      type: 'payment_received',
      date: new Date().toISOString(),
      isRead: false,
      linkToTab: 'savings',
    };
    setNotifications((prev) => [memberNotification, ...prev]);

    // 5. Append to Audit Trail
    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      circleId: currentCircle.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Payment Confirmed by Admin',
      timestamp: new Date().toISOString(),
      oldValue: 'Status: Pending Confirmation',
      newValue: `Status: Paid (Admin ${currentUser.name} confirmed ₹${record.amount} for ${memberName})`,
      ipInfo: '103.14.88.2 (Palakkad, IN)',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(`Payment of ₹${record.amount} from ${memberName} confirmed! Circle fund updated.`);
  };

  // Actions: Circle Admin Declines Savings Payment ("Not Received")
  const handleAdminRejectSavingsPayment = (record: ContributionRecord, reason?: string) => {
    if (!currentUser) return;
    if (currentUser.role === 'member') {
      showToast('Permission denied: Only Circle Admins can decline payment claims.');
      return;
    }

    const member =
      members.find((m) => m.userId === record.userId || m.id === record.userId) ||
      users.find((u) => u.id === record.userId);
    const memberName = member?.name || record.userName || 'Member';

    const rejectedRecord: ContributionRecord = {
      ...record,
      status: 'Pending',
      paidAmount: 0,
      rejectionReason: reason || 'Payment not received in admin account',
      referenceNote: reason ? `Declined: ${reason}` : 'Payment not received',
      adminDecisionDate: new Date().toISOString(),
    };

    setContributions((prev) => {
      const filtered = prev.filter((c) => c.id !== record.id);
      const next = [rejectedRecord, ...filtered];
      saveLocalState('contributions', next);
      return next;
    });

    dbUpsertContribution(rejectedRecord);
    broadcastContributionUpdate(currentCircle.id, rejectedRecord);

    // Notify Member
    const memberNotification: AppNotification = {
      id: `notif-rej-${Date.now()}`,
      circleId: currentCircle.id,
      userId: record.userId,
      title: 'Payment Claim Not Received ⚠️',
      message: `Circle Admin ${currentUser.name} was unable to verify your payment of ₹${record.amount}${reason ? `: "${reason}"` : ''}. Status remains Pending.`,
      type: 'payment_received',
      date: new Date().toISOString(),
      isRead: false,
      linkToTab: 'savings',
    };
    setNotifications((prev) => [memberNotification, ...prev]);

    // Audit Log
    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      circleId: currentCircle.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Payment Declined by Admin',
      timestamp: new Date().toISOString(),
      oldValue: 'Status: Pending Confirmation',
      newValue: `Status: Pending (Admin marked ₹${record.amount} from ${memberName} as Not Received)`,
      ipInfo: '103.14.88.2 (Palakkad, IN)',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(`Marked as Not Received. Status reverted to Pending.`);
  };

  // Actions: Add Expense
  const handleAddExpense = (data: {
    title: string;
    amount: number;
    date: string;
    category: ExpenseCategory;
    paidBy: string;
    description: string;
    receiptUrl?: string;
    tourId?: string;
    notes?: string;
  }) => {
    if (!currentUser) return;
    if (currentUser.role === 'member') {
      showToast('Permission denied: Only Circle Admins can add expenses.');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      circleId: currentCircle.id,
      title: data.title,
      amount: data.amount,
      date: data.date,
      category: data.category,
      paidBy: data.paidBy,
      description: data.description,
      receiptUrl: data.receiptUrl,
      participants: ['all'],
      tourId: data.tourId,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => {
      const next = [newExpense, ...prev];
      saveLocalState('expenses', next);
      return next;
    });
    dbUpsertExpense(newExpense);
    broadcastExpenseUpdate(newExpense);

    const newTx: Transaction = {
      id: `tx-exp-${Date.now()}`,
      circleId: currentCircle.id,
      amount: data.amount,
      type: 'EXPENSE',
      category: data.category,
      date: data.date,
      reference: `EXP-${Date.now().toString().slice(-4)}`,
      createdBy: currentUser.name,
      notes: `${data.title} (${data.description || 'Group expense'})`,
      receiptUrl: data.receiptUrl,
      auditInfo: `Authorized and deducted from common pool`,
    };
    setTransactions((prev) => {
      const next = [newTx, ...prev];
      saveLocalState('transactions', next);
      return next;
    });
    dbInsertTransaction(newTx);
    broadcastTransactionUpdate(newTx);

    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      circleId: currentCircle.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Expense Created',
      timestamp: new Date().toISOString(),
      oldValue: `Fund Balance: ₹${currentBalance}`,
      newValue: `Deducted ₹${data.amount} for "${data.title}"`,
      ipInfo: '103.14.88.2 (Palakkad, IN)',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(`Expense of ₹${data.amount} ("${data.title}") deducted from fund`);
  };

  // Actions: Request Loan
  const handleRequestLoan = (data: {
    principal: number;
    interestRate: number;
    durationMonths: number;
    purpose: string;
    repaymentMethod?: LoanRepaymentMethod;
    cycleDays?: number;
    tenureWeeks?: number;
    weeklyEmiAmount?: number;
  }) => {
    if (wallet.currentBalance <= 0) {
      showToast('No balance available in circle fund to request a loan.');
      return;
    }
    if (data.principal > wallet.currentBalance) {
      showToast(
        `Cannot request ${currentCircle.currencySymbol || '₹'}${data.principal}. Available fund balance is only ${currentCircle.currencySymbol || '₹'}${wallet.currentBalance}.`
      );
      return;
    }

    const isWeekly = data.repaymentMethod === 'weekly_emi';
    const cycleDays = data.cycleDays || 10;
    const tenureWeeks = data.tenureWeeks || 4;

    const periodicInterest = Math.round((data.principal * data.interestRate) / 100);
    const totalInterest = isWeekly
      ? Math.round(((data.principal * data.interestRate) / 100) * (tenureWeeks / 4))
      : periodicInterest * Math.max(1, Math.ceil(cycleDays / 10));

    const totalRepayment = data.principal + totalInterest;
    const weeklyEmi = isWeekly ? Math.round(totalRepayment / tenureWeeks) : 0;

    const dueDays = isWeekly ? tenureWeeks * 7 : cycleDays;
    const dueDate = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      circleId: currentCircle.id,
      borrowerId: currentUser.id,
      borrowerName: currentUser.name,
      borrowerAvatar: currentUser.avatarUrl,
      principal: data.principal,
      interestRate: data.interestRate,
      interestType: 'Monthly',
      durationMonths: data.durationMonths,
      startDate: new Date().toISOString().split('T')[0],
      dueDate,
      monthlyInterest: periodicInterest,
      totalInterest,
      totalRepayment,
      principalPaid: 0,
      interestPaid: 0,
      totalPaid: 0,
      remainingAmount: totalRepayment,
      status: 'Pending',
      purpose: data.purpose,
      repaymentMethod: data.repaymentMethod || 'ten_day_cycle',
      cycleDays: isWeekly ? undefined : cycleDays,
      tenureWeeks: isWeekly ? tenureWeeks : undefined,
      weeklyEmiAmount: isWeekly ? weeklyEmi : undefined,
      installments: isWeekly
        ? Array.from({ length: tenureWeeks }).map((_, i) => ({
            installmentNumber: i + 1,
            dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            principalAmount: Math.round(data.principal / tenureWeeks),
            interestAmount: Math.round(totalInterest / tenureWeeks),
            totalDue: weeklyEmi,
            paidAmount: 0,
            status: 'Pending',
          }))
        : Array.from({ length: Math.max(1, Math.ceil(cycleDays / 10)) }).map((_, i) => ({
            installmentNumber: i + 1,
            dueDate: new Date(Date.now() + (i + 1) * 10 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            principalAmount: 0,
            interestAmount: periodicInterest,
            totalDue: periodicInterest,
            paidAmount: 0,
            status: 'Pending',
          })),
    };

    setLoans((prev) => [newLoan, ...prev]);
    dbUpsertLoan(newLoan);

    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      circleId: currentCircle.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Loan Requested',
      timestamp: new Date().toISOString(),
      newValue: isWeekly
        ? `Requested ₹${data.principal} (Weekly EMI: ₹${weeklyEmi}/wk x ${tenureWeeks}w) for "${data.purpose}"`
        : `Requested ₹${data.principal} (10-Day Cycle: ₹${periodicInterest}/10d) for "${data.purpose}"`,
      ipInfo: '103.14.88.2 (Palakkad, IN)',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(
      isWeekly
        ? `Weekly EMI loan request for ₹${data.principal} (₹${weeklyEmi}/wk) submitted for approval!`
        : `10-Day cycle loan request for ₹${data.principal} submitted for approval!`
    );
  };

  // Actions: Consensus Voting on Loan Requests (All Members + Admin)
  const handleVoteLoan = (loanId: string, decision: 'approve' | 'reject') => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    if (targetLoan.borrowerId === currentUser.id) {
      showToast('Borrowers cannot vote on their own loan request.');
      return;
    }

    const voteRecord: LoanApprovalVote = {
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      decision,
      votedAt: new Date().toISOString(),
    };

    const myIds = [currentUser.id, (currentUser as any)?.userId].filter(Boolean);
    const existingApprovals = targetLoan.approvals || [];
    const otherApprovals = existingApprovals.filter(
      (a) => !myIds.includes(a.userId)
    );
    const updatedApprovals: LoanApprovalVote[] = [...otherApprovals, voteRecord];

    // Compute consensus metrics
    const squadMembers = circleMembers.filter((m) => m.role !== 'circle_admin');
    const totalMemberCount = squadMembers.length;
    // Rule: Minimum 50% members (e.g. 9 members -> 4 required; 8 -> 4; 2 -> 1; 1 -> 1)
    const requiredMemberApprovals =
      totalMemberCount <= 1 ? Math.min(1, totalMemberCount) : Math.floor(totalMemberCount * 0.5);

    const hasAdminApproved = updatedApprovals.some(
      (a) => a.userRole === 'circle_admin' && a.decision === 'approve'
    );
    const memberApprovalsCount = updatedApprovals.filter(
      (a) => a.userRole !== 'circle_admin' && a.decision === 'approve'
    ).length;
    const isCriteriaMet = hasAdminApproved && memberApprovalsCount >= requiredMemberApprovals;

    const updatedLoan: Loan = {
      ...targetLoan,
      approvals: updatedApprovals,
    };

    setLoans((prev) => {
      const next = prev.map((l) => (l.id === loanId ? updatedLoan : l));
      saveLocalState('loans', next);
      return next;
    });
    dbUpsertLoan(updatedLoan);

    if (decision === 'approve') {
      if (isCriteriaMet) {
        showToast(
          `Approval recorded! Consensus criteria met: 1 Admin + ${memberApprovalsCount}/${requiredMemberApprovals} Members. Ready to provide loan.`
        );
      } else {
        showToast(
          `Approval recorded (${memberApprovalsCount}/${requiredMemberApprovals} member approvals, Admin: ${
            hasAdminApproved ? 'Approved' : 'Pending'
          }).`
        );
      }
    } else {
      showToast('Your decision to decline this loan request has been recorded.');
    }
  };

  // Actions: Disburse Loan Once Consensus Threshold (1 Admin + 50% Members) Is Met
  const handleDisburseLoan = (loanId: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    if (currentUser.role === 'member') {
      showToast('Permission denied: Only Circle Admins can provide/disburse loans.');
      return;
    }

    const squadMembers = circleMembers.filter((m) => m.role !== 'circle_admin');
    const totalMemberCount = squadMembers.length;
    const requiredMemberApprovals =
      totalMemberCount <= 1 ? Math.min(1, totalMemberCount) : Math.floor(totalMemberCount * 0.5);

    const approvals = targetLoan.approvals || [];
    const hasAdminApproved = approvals.some(
      (a) => a.userRole === 'circle_admin' && a.decision === 'approve'
    );
    const memberApprovalsCount = approvals.filter(
      (a) => a.userRole !== 'circle_admin' && a.decision === 'approve'
    ).length;

    if (!hasAdminApproved || memberApprovalsCount < requiredMemberApprovals) {
      showToast(
        `Cannot provide loan: Requires 1 Circle Admin approval AND minimum ${requiredMemberApprovals} member approvals (${memberApprovalsCount}/${requiredMemberApprovals} members approved, Admin: ${
          hasAdminApproved ? '✓' : 'Pending'
        }).`
      );
      return;
    }

    if (targetLoan.principal > wallet.currentBalance) {
      showToast(
        `Cannot provide loan: Circle fund has only ${currentCircle.currencySymbol || '₹'}${wallet.currentBalance} available (requires ${currentCircle.currencySymbol || '₹'}${targetLoan.principal}).`
      );
      return;
    }

    const activeLoan: Loan = {
      ...targetLoan,
      status: 'Active',
      reviewedBy: currentUser.name,
      reviewedDate: new Date().toISOString(),
    };

    setLoans((prev) => {
      const next = prev.map((l) => (l.id === loanId ? activeLoan : l));
      saveLocalState('loans', next);
      return next;
    });
    dbUpsertLoan(activeLoan);

    // Disburse fund via double-entry ledger
    const newTx: Transaction = {
      id: `tx-loan-${Date.now()}`,
      circleId: currentCircle.id,
      memberId: targetLoan.borrowerId,
      memberName: targetLoan.borrowerName,
      amount: targetLoan.principal,
      type: 'LOAN_DISBURSEMENT',
      category: 'Internal Loan',
      date: new Date().toISOString(),
      reference: `LOAN-DISB-${Date.now().toString().slice(-4)}`,
      createdBy: currentUser.name,
      notes: `Disbursed ₹${targetLoan.principal} internal loan to ${targetLoan.borrowerName} with squad consensus (1 Admin + ${memberApprovalsCount} Members)`,
      auditInfo: `Consensus verified: 1 Admin + ${memberApprovalsCount}/${requiredMemberApprovals} squad members approved`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    dbInsertTransaction(newTx);

    showToast(
      `Loan of ${currentCircle.currencySymbol || '₹'}${targetLoan.principal} successfully provided and disbursed to ${targetLoan.borrowerName}!`
    );
  };

  // Actions: Review Loan (Wrapper for backwards compatibility)
  const handleReviewLoan = (loanId: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      handleVoteLoan(loanId, 'approve');
    } else {
      if (currentUser.role !== 'member') {
        let updatedLoanToSave: Loan | null = null;
        setLoans((prev) =>
          prev.map((l) => {
            if (l.id === loanId) {
              const updated: Loan = {
                ...l,
                status: 'Rejected',
                reviewedBy: currentUser.name,
                reviewedDate: new Date().toISOString(),
              };
              updatedLoanToSave = updated;
              return updated;
            }
            return l;
          })
        );
        if (updatedLoanToSave) {
          dbUpsertLoan(updatedLoanToSave);
        }
        showToast('Loan request has been declined.');
      } else {
        handleVoteLoan(loanId, 'reject');
      }
    }
  };

  // Actions: Update Loan Details (Circle Admin Only)
  const handleUpdateLoan = (updatedLoan: Loan) => {
    if (currentUser?.role === 'member') {
      showToast('Permission denied: Only Circle Admins can edit loan details.');
      return;
    }

    setLoans((prev) =>
      prev.map((l) => (l.id === updatedLoan.id ? updatedLoan : l))
    );
    dbUpsertLoan(updatedLoan);

    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      circleId: currentCircle.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Loan Terms Edited',
      timestamp: new Date().toISOString(),
      newValue: `Admin ${currentUser.name} updated loan for ${updatedLoan.borrowerName}: Principal ₹${updatedLoan.principal}, Interest ${updatedLoan.interestRate}%, Due: ${updatedLoan.dueDate}, Status: ${updatedLoan.status}, Method: ${updatedLoan.repaymentMethod === 'weekly_emi' ? 'Weekly EMI' : '10-Day Cycle'}`,
      ipInfo: '103.14.88.2 (Palakkad, IN)',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(`Loan for ${updatedLoan.borrowerName} updated successfully.`);
  };

  // Actions: Repay Loan Installment or Full Settlement
  const handleRepayLoan = (data: {
    loanId: string;
    amount: number;
    principalAmount: number;
    interestAmount: number;
    paymentMethod: string;
    isFullSettlement?: boolean;
  }) => {
    let updatedLoanToSave: Loan | null = null;
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === data.loanId) {
          const isFullyRepaid = data.isFullSettlement || (l.principal - (l.principalPaid + data.principalAmount) <= 0);
          const newPrincipalPaid = data.isFullSettlement ? l.principal : (l.principalPaid + data.principalAmount);
          const newInterestPaid = l.interestPaid + data.interestAmount;
          const newTotalPaid = l.totalPaid + data.amount;
          const newRemaining = isFullyRepaid ? 0 : Math.max(0, l.principal - newPrincipalPaid);

          const updated: Loan = {
            ...l,
            principalPaid: newPrincipalPaid,
            interestPaid: newInterestPaid,
            totalPaid: newTotalPaid,
            remainingAmount: newRemaining,
            status: isFullyRepaid ? 'Repaid' : 'Active',
          };
          updatedLoanToSave = updated;
          return updated;
        }
        return l;
      })
    );

    if (updatedLoanToSave) {
      dbUpsertLoan(updatedLoanToSave);
    }

    const newTxs: Transaction[] = [];

    // Ledger entry for principal return (if principal returned)
    if (data.principalAmount > 0) {
      newTxs.push({
        id: `tx-rep-p-${Date.now()}`,
        circleId: currentCircle.id,
        amount: data.principalAmount,
        type: 'LOAN_PRINCIPAL_REPAYMENT',
        category: 'Loan Principal Return',
        date: new Date().toISOString(),
        reference: `LOAN-REP-P-${Date.now().toString().slice(-4)}`,
        createdBy: currentUser.name,
        notes: data.isFullSettlement ? `Full loan settlement principal return` : `Loan installment principal return`,
        auditInfo: `Credited back to circle capital fund`,
      });
    }

    // Ledger entry for interest earned (if interest paid)
    if (data.interestAmount > 0) {
      newTxs.push({
        id: `tx-rep-i-${Date.now()}`,
        circleId: currentCircle.id,
        amount: data.interestAmount,
        type: 'INTEREST_PAYMENT',
        category: 'Circle Interest Income',
        date: new Date().toISOString(),
        reference: `LOAN-INT-${Date.now().toString().slice(-4)}`,
        createdBy: currentUser.name,
        notes: data.isFullSettlement ? `Full loan settlement interest revenue` : `Interest income from loan installment`,
        auditInfo: `Earned interest added to common group pool`,
      });
    }

    if (newTxs.length > 0) {
      setTransactions((prev) => [...newTxs, ...prev]);
      newTxs.forEach((tx) => dbInsertTransaction(tx));
    }

    if (data.isFullSettlement) {
      showToast(`Loan settled in full! ₹${data.amount} (Principal ₹${data.principalAmount} + Interest ₹${data.interestAmount}). Loan marked as Repaid.`);
    } else {
      showToast(`Loan installment of ₹${data.amount} recorded!`);
    }
  };

  // Actions: Create Tour Proposal
  const handleCreateTour = (data: {
    title: string;
    destination: string;
    duration: string;
    startDate: string;
    endDate: string;
    estimatedBudget: number;
    travelBudget: number;
    hotelBudget: number;
    foodBudget: number;
    activityBudget: number;
    emergencyBudget: number;
  }) => {
    const newTour: Tour = {
      id: `tour-${Date.now()}`,
      circleId: currentCircle.id,
      title: data.title,
      destination: data.destination,
      duration: data.duration,
      startDate: data.startDate,
      endDate: data.endDate,
      estimatedBudget: data.estimatedBudget,
      allocatedFromCircle: 0,
      status: 'planning',
      bannerUrl:
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
      budgetBreakdown: [
        { category: 'Travel', allocated: data.travelBudget, actualSpent: 0 },
        { category: 'Hotel', allocated: data.hotelBudget, actualSpent: 0 },
        { category: 'Food', allocated: data.foodBudget, actualSpent: 0 },
        { category: 'Activities', allocated: data.activityBudget, actualSpent: 0 },
        { category: 'Emergency', allocated: data.emergencyBudget, actualSpent: 0 },
      ],
      attendingMemberIds: circleMembers.map((m) => m.userId),
      itinerary: [
        { day: 1, title: 'Arrival & Check-in', description: 'Arrival, resort check-in, beach sunset walk and welcome squad dinner.' },
        { day: 2, title: 'Sightseeing & Water Sports', description: 'Water sports, island boat tour, and beachside barbecue.' },
        { day: 3, title: 'Local Culture & Shopping', description: 'Heritage walks, local markets, and nightlife.' },
        { day: 4, title: 'Farewell & Return', description: 'Souvenir shopping, checkout, and return journey.' },
      ],
      documents: [
        { title: 'Hotel Booking Voucher', url: '#', type: 'PDF' },
        { title: 'Train/Flight Tickets', url: '#', type: 'PDF' },
      ],
      notes: 'All expenses will be tracked with itemized receipts in the tour budget ledger.',
    };

    setTours((prev) => {
      const next = [newTour, ...prev];
      saveLocalState('tours', next);
      return next;
    });
    dbUpsertTour(newTour);

    // Create a consensus poll automatically
    const newVote: Vote = {
      id: `vote-${Date.now()}`,
      circleId: currentCircle.id,
      title: `Approve "${data.title}" (${data.destination}) budget of ₹${data.estimatedBudget.toLocaleString()}?`,
      description: `Tour proposed for ${data.duration}. Estimated cost per friend: ₹${Math.round(
        data.estimatedBudget / (circleMembers.length || 10)
      ).toLocaleString()}.`,
      category: 'Tour',
      options: [
        { id: 'opt-yes', text: '👍 Yes, approve itinerary & budget', votesCount: 1, voterIds: [currentUser.id] },
        { id: 'opt-no', text: '👎 Need adjustments / too high', votesCount: 0, voterIds: [] },
      ],
      status: 'active',
      deadline: data.startDate,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
      thresholdPercentage: 60,
    };
    setVotes((prev) => {
      const next = [newVote, ...prev];
      saveLocalState('votes', next);
      return next;
    });
    dbUpsertVote(newVote);

    showToast(`Tour plan "${data.title}" created with consensus poll`);
  };

  const handleUpdateTour = (updatedTour: Tour) => {
    setTours((prev) => {
      const next = prev.map((t) => (t.id === updatedTour.id ? updatedTour : t));
      saveLocalState('tours', next);
      return next;
    });
    dbUpsertTour(updatedTour);
    showToast(`Tour plan "${updatedTour.title}" updated successfully`);
  };

  const handleDeleteTour = (tourId: string) => {
    const target = tours.find((t) => t.id === tourId);
    const tourTitle = target?.title || 'Tour';
    setTours((prev) => {
      const next = prev.filter((t) => t.id !== tourId);
      saveLocalState('tours', next);
      return next;
    });
    dbDeleteTour(tourId, currentCircle?.id);
    showToast(`Tour plan "${tourTitle}" has been deleted`);
  };

  // Actions: Add Member
  const handleAddMember = (data: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    role: 'circle_admin' | 'member';
  }) => {
    const newUserId = `user-${Date.now()}`;
    const autoEmail = data.email || `${data.name.toLowerCase().replace(/\s+/g, '')}@buddyfund.app`;
    const newUser: User = {
      id: newUserId,
      name: data.name,
      email: autoEmail,
      phone: data.phone,
      password: data.password || 'buddy123',
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
      role: data.role,
      joinedDate: new Date().toISOString().split('T')[0],
      circleIds: [currentCircle.id],
      isVerified: true,
      status: 'active',
    };
    setUsers((prev) => [...prev, newUser]);

    const newMember: CircleMember = {
      id: `cm-${Date.now()}`,
      userId: newUserId,
      circleId: currentCircle.id,
      name: data.name,
      email: autoEmail,
      phone: data.phone,
      password: data.password || 'buddy123',
      avatarUrl: newUser.avatarUrl,
      role: data.role,
      joinedDate: new Date().toISOString().split('T')[0],
      totalContributed: 0,
      totalReceived: 0,
      pendingContribution: currentCircle.contributionAmount,
      outstandingLoan: 0,
      loanRepaymentStatus: 'none',
    };
    setMembers((prev) => [...prev, newMember]);
    dbUpsertMember(newMember);

    showToast(`Added ${data.name} to ${currentCircle.name}`);
  };

  const handleUpdateMemberRole = (userId: string, newRole: 'circle_admin' | 'member') => {
    setMembers((prev) =>
      prev.map((m) =>
        m.userId === userId && m.circleId === currentCircle.id ? { ...m, role: newRole } : m
      )
    );
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    showToast(`Updated member role to ${newRole === 'circle_admin' ? 'Circle Admin' : 'Squad Member'}`);
  };

  const handleRemoveMember = (userId: string) => {
    const memberToRemove = members.find(
      (m) => m.userId === userId && m.circleId === currentCircle.id
    );
    if (!memberToRemove) return;
    setMembers((prev) =>
      prev.filter((m) => !(m.userId === userId && m.circleId === currentCircle.id))
    );
    showToast(`Removed ${memberToRemove.name} from ${currentCircle.name}`);
  };

  // Actions: Create Circle
  const handleCreateCircle = (data: {
    name: string;
    description: string;
    contributionAmount: number;
    contributionFrequency: 'weekly' | 'monthly';
    contributionDay: string;
    adminSecretCode?: string;
    adminName?: string;
    adminPhotoUrl?: string;
  }) => {
    const newCircleId = `circle-${Date.now()}`;
    const adminName = data.adminName?.trim() || currentUser?.name || 'Circle Admin';
    const adminPhotoUrl =
      data.adminPhotoUrl ||
      currentUser?.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const newCircle: Circle = {
      id: newCircleId,
      name: data.name,
      description: data.description,
      photoUrl:
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
      currency: 'INR',
      currencySymbol: '₹',
      contributionFrequency: data.contributionFrequency,
      contributionAmount: data.contributionAmount,
      contributionDay: data.contributionDay,
      startDate: new Date().toISOString().split('T')[0],
      expectedMembers: 10,
      rules: [
        `Every member contributes ₹${data.contributionAmount} ${data.contributionFrequency} on ${data.contributionDay}.`,
        'All tour expenses and major disbursements require consensus voting.',
      ],
      createdBy: adminName,
      createdAt: new Date().toISOString(),
      planTier: 'free',
      inviteCode: `BUDDY-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      adminSecretCode: data.adminSecretCode || 'ADMIN2026',
      adminName: adminName,
      adminPhotoUrl: adminPhotoUrl,
    };

    setCircles((prev) => [...prev, newCircle]);
    setCurrentCircleId(newCircleId);
    dbUpsertCircle(newCircle);

    // Add current user / admin as admin member of new circle
    const adminUserId = currentUser?.id || `admin-${newCircleId}`;
    const newAdminMember: CircleMember = {
      id: `cm-admin-${Date.now()}`,
      userId: adminUserId,
      circleId: newCircleId,
      name: adminName,
      email: currentUser?.email || 'admin@buddyfund.local',
      phone: currentUser?.phone || '+91 98401 00000',
      avatarUrl: adminPhotoUrl,
      role: 'circle_admin',
      joinedDate: new Date().toISOString().split('T')[0],
      totalContributed: 0,
      totalReceived: 0,
      pendingContribution: data.contributionAmount,
      outstandingLoan: 0,
      loanRepaymentStatus: 'none',
    };
    setMembers((prev) => [...prev, newAdminMember]);
    dbUpsertMember(newAdminMember);

    showToast(`Circle "${data.name}" created! You are now managing this squad.`);
  };

  // Actions: Update Circle (Admin Only)
  const handleUpdateCircle = async (updatedCircle: Circle) => {
    if (currentUser?.role === 'member') {
      showToast('Permission denied: Only Circle Admins can edit circle settings.');
      return;
    }

    setCircles((prev) => {
      const next = prev.map((c) => (c.id === updatedCircle.id ? updatedCircle : c));
      saveLocalState('circles', next);
      return next;
    });

    await dbUpsertCircle(updatedCircle);
    showToast(`Circle "${updatedCircle.name}" settings updated!`);
  };

  // Actions: Delete Circle with Warning Confirmation (Admin Only)
  const handleConfirmDeleteCircle = async (circleId: string) => {
    if (currentUser?.role === 'member') {
      showToast('Permission denied: Only Circle Admins can delete circles.');
      return;
    }

    const targetCircle = circles.find((c) => c.id === circleId);
    const targetName = targetCircle ? targetCircle.name : 'Circle';

    // 1. Remove circle from state & localStorage
    const remainingCircles = circles.filter((c) => c.id !== circleId);
    setCircles(remainingCircles);
    saveLocalState('circles', remainingCircles);

    // 2. Cascade delete linked records
    setMembers((prev) => {
      const next = prev.filter((m) => m.circleId !== circleId);
      saveLocalState('members', next);
      return next;
    });
    setContributions((prev) => {
      const next = prev.filter((c) => c.circleId !== circleId);
      saveLocalState('contributions', next);
      return next;
    });
    setTransactions((prev) => {
      const next = prev.filter((t) => t.circleId !== circleId);
      saveLocalState('transactions', next);
      return next;
    });
    setExpenses((prev) => {
      const next = prev.filter((e) => e.circleId !== circleId);
      saveLocalState('expenses', next);
      return next;
    });
    setTours((prev) => {
      const next = prev.filter((t) => t.circleId !== circleId);
      saveLocalState('tours', next);
      return next;
    });
    setLoans((prev) => {
      const next = prev.filter((l) => l.circleId !== circleId);
      saveLocalState('loans', next);
      return next;
    });
    setGoals((prev) => {
      const next = prev.filter((g) => g.circleId !== circleId);
      saveLocalState('goals', next);
      return next;
    });
    setVotes((prev) => {
      const next = prev.filter((v) => v.circleId !== circleId);
      saveLocalState('votes', next);
      return next;
    });
    setAuditLogs((prev) => {
      const next = prev.filter((a) => a.circleId !== circleId);
      saveLocalState('audit_logs', next);
      return next;
    });

    // 3. Switch active circle if the deleted one was currently selected
    if (currentCircleId === circleId) {
      setCurrentCircleId(remainingCircles[0]?.id || '');
    }

    // 4. Delete from Supabase
    await dbDeleteCircle(circleId);

    showToast(`Circle "${targetName}" has been deleted.`);
  };

  // Actions: Update Current User Profile
  const handleUpdateUserProfile = (updatedData: {
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
  }) => {
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      ...updatedData,
    };

    // 1. Update currentUser in state & localStorage
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('buddyfund_current_user', JSON.stringify(updatedUser));
    } catch {}

    // 2. Update users roster
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === currentUser.id ? updatedUser : u));
      saveLocalState('users', next);
      return next;
    });

    // 3. Update member entry across circles
    setMembers((prev) => {
      const next = prev.map((m) => {
        if (m.userId === currentUser.id || m.name === currentUser.name) {
          const updatedMember = {
            ...m,
            name: updatedData.name,
            email: updatedData.email,
            phone: updatedData.phone,
            avatarUrl: updatedData.avatarUrl,
          };
          dbUpsertMember(updatedMember);
          return updatedMember;
        }
        return m;
      });
      saveLocalState('members', next);
      return next;
    });

    // 4. If user is circle admin, also update circle admin name & photo
    if (currentCircle && (currentUser.role === 'circle_admin' || currentUser.role === 'super_admin')) {
      const updatedCircle: Circle = {
        ...currentCircle,
        adminName: updatedData.name,
        adminPhotoUrl: updatedData.avatarUrl,
      };
      setCircles((prev) => {
        const next = prev.map((c) => (c.id === currentCircle.id ? updatedCircle : c));
        saveLocalState('circles', next);
        return next;
      });
      dbUpsertCircle(updatedCircle);
    }

    showToast('Profile updated successfully!');
  };

  // Actions: Voting
  const handleCastVote = (voteId: string, optionId: string) => {
    const currentVote = votes.find((v) => v.id === voteId);
    if (!currentVote) return;

    const voterInfo: VoterDetail = {
      id: currentUser.id,
      name: currentUser.name,
      avatarUrl: currentUser.avatarUrl,
      role: currentUser.role,
      votedAt: new Date().toISOString(),
    };

    const userIds = [currentUser.id, (currentUser as any)?.userId].filter(Boolean);
    const matchesUser = (id: string) => userIds.includes(id);

    const updatedOptions = currentVote.options.map((opt) => {
      const hasVoted = opt.voterIds.some(matchesUser);
      if (opt.id === optionId) {
        if (hasVoted) return opt; // already voted
        return {
          ...opt,
          votesCount: opt.votesCount + 1,
          voterIds: [...opt.voterIds.filter((id) => !matchesUser(id)), currentUser.id],
          voters: [...(opt.voters || []).filter((v) => !matchesUser(v.id)), voterInfo],
        };
      } else {
        // Remove vote if switching
        if (hasVoted) {
          return {
            ...opt,
            votesCount: Math.max(0, opt.votesCount - 1),
            voterIds: opt.voterIds.filter((id) => !matchesUser(id)),
            voters: (opt.voters || []).filter((v) => !matchesUser(v.id)),
          };
        }
        return opt;
      }
    });

    const updatedVote: Vote = { ...currentVote, options: updatedOptions };
    setVotes((prev) => {
      const next = prev.map((v) => (v.id === voteId ? updatedVote : v));
      saveLocalState('votes', next);
      return next;
    });
    dbUpsertVote(updatedVote);
    showToast('Your vote has been recorded on this proposal');
  };

  const handleCreateVote = (data: {
    title: string;
    description: string;
    deadline: string;
    thresholdPercentage: number;
  }) => {
    const creatorVoter: VoterDetail = {
      id: currentUser.id,
      name: currentUser.name,
      avatarUrl: currentUser.avatarUrl,
      role: currentUser.role,
      votedAt: new Date().toISOString(),
    };

    const newVote: Vote = {
      id: `vote-${Date.now()}`,
      circleId: currentCircle.id,
      title: data.title,
      description: data.description,
      category: 'Rule Change',
      options: [
        {
          id: `opt-1-${Date.now()}`,
          text: '👍 Yes, approve proposal',
          votesCount: 1,
          voterIds: [currentUser.id],
          voters: [creatorVoter],
        },
        { id: `opt-2-${Date.now()}`, text: '👎 Reject proposal', votesCount: 0, voterIds: [], voters: [] },
      ],
      status: 'active',
      deadline: data.deadline,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
      thresholdPercentage: data.thresholdPercentage,
    };
    setVotes((prev) => {
      const next = [newVote, ...prev];
      saveLocalState('votes', next);
      return next;
    });
    dbUpsertVote(newVote);
    showToast('Consensus proposal published to circle');
  };

  const handleDeleteVote = (voteId: string) => {
    if (currentUser.role === 'member') {
      const vote = votes.find((v) => v.id === voteId);
      if (vote?.createdBy !== currentUser.name) {
        showToast('Permission denied: Only Circle Admins or proposal creator can delete polls.');
        return;
      }
    }
    setVotes((prev) => {
      const next = prev.filter((v) => v.id !== voteId);
      saveLocalState('votes', next);
      return next;
    });
    dbDeleteVote(voteId, currentCircle?.id);
    showToast('Decision proposal removed');
  };

  const handleCloseVote = (voteId: string) => {
    if (currentUser.role === 'member') {
      showToast('Permission denied: Only Circle Admins can close voting.');
      return;
    }
    const currentVote = votes.find((v) => v.id === voteId);
    if (!currentVote) return;
    const closedVote: Vote = { ...currentVote, status: 'closed' };
    setVotes((prev) => {
      const next = prev.map((v) => (v.id === voteId ? closedVote : v));
      saveLocalState('votes', next);
      return next;
    });
    dbUpsertVote(closedVote);
    showToast('Proposal closed for voting');
  };

  // Actions: Goals
  const handleAddGoal = (data: { title: string; targetAmount: number; targetDate: string; category: string }) => {
    if (currentUser.role === 'member') {
      showToast('Permission denied: Only Circle Admins can create goals.');
      return;
    }

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      circleId: currentCircle.id,
      title: data.title,
      targetAmount: data.targetAmount,
      currentAmount: 0,
      targetDate: data.targetDate,
      category: data.category as any,
      description: 'Dedicated savings allocation goal from common savings.',
      icon: 'Target',
    };
    setGoals((prev) => {
      const next = [newGoal, ...prev];
      saveLocalState('goals', next);
      return next;
    });
    dbUpsertGoal(newGoal);
    broadcastGoalUpdate(currentCircle.id, newGoal);
    showToast(`Savings target "${data.title}" added`);
  };

  const handleAllocateFund = (goalId: string, amount: number) => {
    if (currentUser.role === 'member') {
      showToast('Permission denied: Only Circle Admins can allocate funds.');
      return;
    }

    setGoals((prev) => {
      let updatedGoal: Goal | null = null;
      const next = prev.map((g) => {
        if (g.id === goalId) {
          const updated = { ...g, currentAmount: g.currentAmount + amount };
          updatedGoal = updated;
          dbUpsertGoal(updated);
          return updated;
        }
        return g;
      });
      saveLocalState('goals', next);
      if (updatedGoal) {
        broadcastGoalUpdate(currentCircle.id, updatedGoal);
      }
      return next;
    });
    showToast(`Allocated ₹${amount} towards goal`);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (currentUser.role === 'member') {
      showToast('Permission denied: Only Circle Admins can delete goals.');
      return;
    }

    setGoals((prev) => {
      const next = prev.filter((g) => g.id !== goalId);
      saveLocalState('goals', next);
      return next;
    });
    dbDeleteGoal(goalId, currentCircle.id);
    broadcastGoalDelete(currentCircle.id, goalId);
    showToast('Savings target removed');
  };

  // Actions: Ledger Adjustment
  const handleAddAdjustment = (data: { amount: number; reason: string; type: TransactionType }) => {
    const newTx: Transaction = {
      id: `tx-adj-${Date.now()}`,
      circleId: currentCircle.id,
      amount: data.amount,
      type: data.type,
      category: 'Adjustment',
      date: new Date().toISOString(),
      reference: `ADJ-${Date.now().toString().slice(-4)}`,
      createdBy: currentUser?.name || 'Authorized Member',
      notes: data.reason,
      auditInfo: `Ledger manual reconciliation entry`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Ledger adjustment of ₹${data.amount} recorded`);
  };

  // If user is not logged in, show dedicated Circle Admin & Member Auth Portal
  if (!currentUser) {
    return (
      <AuthPage
        circles={circles}
        members={members}
        onLoginAsAdmin={handleLoginAsAdmin}
        onLoginAsMember={handleLoginAsMember}
        onCreateCircleAndLogin={handleCreateCircleAndLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col antialiased selection:bg-emerald-500 selection:text-white pb-20 lg:pb-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Global Header */}
      <Header
        currentUser={currentUser}
        allUsers={users.length > 0 ? users : [currentUser]}
        circles={circles}
        currentCircle={currentCircle}
        notifications={notifications}
        onSelectCircle={handleSelectCircle}
        onSwitchUser={handleSwitchUser}
        onOpenCreateCircle={() => setIsCreateCircleOpen(true)}
        onOpenEditCircle={(circle) => setCircleToEdit(circle)}
        onOpenDeleteCircle={(circle) => setCircleToDelete(circle)}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onNavigateTab={handleNavigateTab}
        onOpenLoginModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleNavigateTab}
          userRole={currentUser.role}
          unreadCount={notifications.filter((n) => !n.isRead).length}
          onOpenCreateCircle={() => setIsCreateCircleOpen(true)}
          onOpenMobileAppModal={() => setIsMobileAppModalOpen(true)}
        />

        {/* Main Content Stage */}
        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8 min-w-0 max-w-full">
          {!currentCircle && activeTab !== 'superadmin' ? (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">No Circle Active</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {currentUser.role === 'member'
                    ? 'Your Circle Admin has not set up a circle yet. Please contact your squad administrator.'
                    : 'Get started by creating your squad circle to track group savings, tours, loans, and expenses.'}
                </p>
              </div>
              {currentUser.role !== 'member' && (
                <button
                  onClick={() => setIsCreateCircleOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Circle</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && currentCircle && (
                <DashboardTab
                  circle={currentCircle}
                  currentUser={currentUser}
                  wallet={wallet}
                  membersCount={circleMembers.length}
                  currentWeekStats={currentWeekStats}
                  upcomingTour={upcomingTour}
                  recentTransactions={circleTransactions}
                  activeLoans={circleLoans.filter((l) => l.status === 'Active')}
                  goals={circleGoals}
                  weeklyChartData={weeklyChartData}
                  expenseChartData={expenseChartData}
                  onNavigateTab={handleNavigateTab}
                  onOpenRecordPaymentModal={() => {
                    if (currentUser.role !== 'member') setIsRecordPaymentOpen(true);
                  }}
                  onOpenAddExpenseModal={() => {
                    if (currentUser.role !== 'member') setIsAddExpenseOpen(true);
                  }}
                  onOpenRequestLoanModal={() => setIsRequestLoanOpen(true)}
                  onOpenTourProposalModal={() => setIsTourProposalOpen(true)}
                />
              )}

              {activeTab === 'savings' && currentCircle && (
                <SavingsTab
                  circle={currentCircle}
                  currentUser={currentUser}
                  contributions={circleContributions}
                  members={circleMembers}
                  onRecordPayment={handleRecordPayment}
                  onOpenRecordModal={() => {
                    if (currentUser.role !== 'member') setIsRecordPaymentOpen(true);
                  }}
                  onMemberSubmitPayment={handleMemberSubmitSavingsPayment}
                  onAdminConfirmPayment={handleAdminConfirmSavingsPayment}
                  onAdminRejectPayment={handleAdminRejectSavingsPayment}
                />
              )}

              {activeTab === 'ledger' && currentUser.role !== 'member' && currentCircle && (
                <LedgerTab
                  circle={currentCircle}
                  currentUser={currentUser}
                  transactions={circleTransactions}
                  members={circleMembers}
                  wallet={wallet}
                  onAddAdjustment={handleAddAdjustment}
                />
              )}

              {activeTab === 'expenses' && currentCircle && (
                <ExpensesTab
                  circle={currentCircle}
                  currentUser={currentUser}
                  expenses={circleExpenses}
                  tours={circleTours}
                  onAddExpense={handleAddExpense}
                  onOpenAddModal={() => {
                    if (currentUser.role !== 'member') setIsAddExpenseOpen(true);
                  }}
                />
              )}

              {activeTab === 'tours' && currentCircle && (
                <ToursTab
                  circle={currentCircle}
                  currentUser={currentUser}
                  tours={circleTours}
                  members={circleMembers}
                  onOpenCreateModal={() => setIsTourProposalOpen(true)}
                  onEditTour={handleUpdateTour}
                  onDeleteTour={handleDeleteTour}
                />
              )}

              {activeTab === 'loans' && currentCircle && (
                <LoansTab
                  circle={currentCircle}
                  currentUser={currentUser}
                  loans={circleLoans}
                  members={circleMembers}
                  interestEarnedTotal={interestEarned}
                  availableBalance={wallet.currentBalance}
                  onRequestLoan={handleRequestLoan}
                  onReviewLoan={handleReviewLoan}
                  onVoteLoan={handleVoteLoan}
                  onDisburseLoan={handleDisburseLoan}
                  onUpdateLoan={handleUpdateLoan}
                  onRepayLoan={handleRepayLoan}
                  onOpenRequestModal={() => setIsRequestLoanOpen(true)}
                />
              )}

              {activeTab === 'members' && currentCircle && (
                <MembersTab
                  circle={currentCircle}
                  currentUser={currentUser}
                  members={circleMembers}
                  onAddMember={handleAddMember}
                  onOpenAddModal={() => setIsAddMemberOpen(true)}
                  onSelectMemberForPayment={(m) => {
                    if (currentUser.role !== 'member') {
                      setSelectedMemberForPayment(m.userId);
                      setIsRecordPaymentOpen(true);
                    }
                  }}
                  onUpdateRole={handleUpdateMemberRole}
                  onRemoveMember={handleRemoveMember}
                />
              )}

              {activeTab === 'goals' && currentCircle && (
                <GoalsTab
                  circle={currentCircle}
                  currentUser={currentUser}
                  goals={circleGoals}
                  onAddGoal={handleAddGoal}
                  onAllocateFund={handleAllocateFund}
                  onDeleteGoal={handleDeleteGoal}
                />
              )}

              {activeTab === 'voting' && currentCircle && (
                <VotingTab
                  circle={currentCircle}
                  currentUser={currentUser}
                  votes={circleVotes}
                  members={circleMembers}
                  allUsers={users}
                  onCastVote={handleCastVote}
                  onCreateVote={handleCreateVote}
                  onDeleteVote={handleDeleteVote}
                  onCloseVote={handleCloseVote}
                />
              )}

              {activeTab === 'reports' && currentUser.role !== 'member' && currentCircle && (
                <ReportsTab
                  circle={currentCircle}
                  currentUser={currentUser}
                  contributions={circleContributions}
                  expenses={circleExpenses}
                  loans={circleLoans}
                  tours={circleTours}
                  transactions={circleTransactions}
                  wallet={wallet}
                />
              )}

              {activeTab === 'audit' && currentUser.role !== 'member' && <AuditLogTab logs={circleAuditLogs} />}

              {activeTab === 'profile' && (
                <MemberProfileView
                  currentUser={currentUser}
                  circle={currentCircle}
                  contributions={circleContributions}
                  members={circleMembers}
                  loans={circleLoans}
                  tours={circleTours}
                  onUpdateProfile={handleUpdateUserProfile}
                />
              )}

              {activeTab === 'superadmin' && <SuperAdminTab circles={circles} users={users} />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        currentUser={currentUser}
        unreadCount={notifications.filter((n) => !n.isRead).length}
        onSelectTab={handleNavigateTab}
        onOpenMoreMenu={() => setShowMobileMoreMenu(true)}
      />

      {/* Mobile More Actions Drawer Modal */}
      {showMobileMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white rounded-t-3xl max-w-lg w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-base font-cute" style={{ fontFamily: "'Comfortaa', 'Fredoka', 'Quicksand', cursive, sans-serif" }}>Ithanu_njangal Modules</span>
              <button
                onClick={() => setShowMobileMoreMenu(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'tours', label: '🏖️ Tour Planning' },
                { id: 'ledger', label: '📖 Common Ledger' },
                { id: 'loans', label: '🪙 Internal Loans' },
                { id: 'members', label: '👥 Squad Members' },
                { id: 'goals', label: '🎯 Savings Targets' },
                { id: 'voting', label: '🗳️ Decision Polls' },
                { id: 'reports', label: '📊 Financial Statements' },
                { id: 'audit', label: '🛡️ Security & Audit' },
              ]
                .filter((item) => currentUser.role !== 'member' || !['ledger', 'reports', 'audit'].includes(item.id))
                .map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavigateTab(item.id);
                    setShowMobileMoreMenu(false);
                  }}
                  className={`p-3 rounded-xl border text-left font-medium transition ${
                    activeTab === item.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {currentUser.role === 'super_admin' && (
                <button
                  onClick={() => {
                    setActiveTab('superadmin');
                    setShowMobileMoreMenu(false);
                  }}
                  className="p-3 rounded-xl border border-purple-200 bg-purple-50 text-purple-800 text-left font-semibold col-span-2"
                >
                  Super Admin Console
                </button>
              )}
            </div>

            {/* Mobile App Download Card */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowMobileMoreMenu(false);
                  setIsMobileAppModalOpen(true);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold flex items-center justify-between shadow-md active:scale-98 transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📱</span>
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight">Get BuddyFund Mobile App</div>
                    <div className="text-[10px] text-emerald-100 font-normal leading-tight">Android APK &bull; Add to Home Screen</div>
                  </div>
                </div>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-lg font-semibold">Install</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      <CreateCircleModal
        isOpen={isCreateCircleOpen}
        onClose={() => setIsCreateCircleOpen(false)}
        onCreate={handleCreateCircle}
        defaultAdminName={currentUser?.name}
        defaultAdminPhotoUrl={currentUser?.avatarUrl}
      />

      <EditCircleModal
        isOpen={Boolean(circleToEdit)}
        onClose={() => setCircleToEdit(null)}
        circle={circleToEdit}
        onSave={handleUpdateCircle}
      />

      <DeleteCircleModal
        isOpen={Boolean(circleToDelete)}
        onClose={() => setCircleToDelete(null)}
        circle={circleToDelete}
        onConfirmDelete={handleConfirmDeleteCircle}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setSelectedMemberForPayment(undefined);
        }}
        circle={currentCircle}
        members={circleMembers}
        initialMemberId={selectedMemberForPayment}
        onRecord={handleRecordPayment}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        tours={circleTours}
        onAdd={handleAddExpense}
      />

      <RequestLoanModal
        isOpen={isRequestLoanOpen}
        onClose={() => setIsRequestLoanOpen(false)}
        circle={currentCircle}
        availableBalance={wallet.currentBalance}
        onRequest={handleRequestLoan}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAdd={handleAddMember}
      />

      <TourProposalModal
        isOpen={isTourProposalOpen}
        onClose={() => setIsTourProposalOpen(false)}
        circle={currentCircle}
        members={circleMembers}
        onCreateTour={handleCreateTour}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        allUsers={users}
        onLoginAsUser={handleSwitchUser}
      />

      <MobileAppModal
        isOpen={isMobileAppModalOpen}
        onClose={() => setIsMobileAppModalOpen(false)}
      />
    </div>
  );
}
