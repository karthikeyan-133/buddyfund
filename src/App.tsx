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
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { RequestLoanModal } from './components/modals/RequestLoanModal';
import { AddMemberModal } from './components/modals/AddMemberModal';
import { TourProposalModal } from './components/modals/TourProposalModal';
import { AuthModal } from './components/modals/AuthModal';

// Initial Mock Data
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
  User,
  Circle,
  CircleMember,
  ContributionRecord,
  Transaction,
  Expense,
  Tour,
  Loan,
  Goal,
  Vote,
  AppNotification,
  AuditLog,
  TransactionType,
  ExpenseCategory,
} from './types';

import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  // Core Entities State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Karthik Raja (Admin)
  const [circles, setCircles] = useState<Circle[]>(INITIAL_CIRCLES);
  const [currentCircleId, setCurrentCircleId] = useState<string>(INITIAL_CIRCLES[0].id);

  // Circle Data
  const [members, setMembers] = useState<CircleMember[]>(INITIAL_MEMBERS);
  const [contributions, setContributions] = useState<ContributionRecord[]>(INITIAL_CONTRIBUTIONS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [tours, setTours] = useState<Tour[]>(INITIAL_TOURS);
  const [loans, setLoans] = useState<Loan[]>(INITIAL_LOANS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [votes, setVotes] = useState<Vote[]>(INITIAL_VOTES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Active Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);

  // Modals state
  const [isCreateCircleOpen, setIsCreateCircleOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isRequestLoanOpen, setIsRequestLoanOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isTourProposalOpen, setIsTourProposalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
  const currentCircle = circles.find((c) => c.id === currentCircleId) || circles[0];

  // Circle-filtered entities
  const circleMembers = members.filter((m) => m.circleId === currentCircle.id);
  const circleContributions = contributions.filter((c) => c.circleId === currentCircle.id);
  const circleTransactions = transactions.filter((t) => t.circleId === currentCircle.id);
  const circleExpenses = expenses.filter((e) => e.circleId === currentCircle.id);
  const circleTours = tours.filter((t) => t.circleId === currentCircle.id);
  const circleLoans = loans.filter((l) => l.circleId === currentCircle.id);
  const circleGoals = goals.filter((g) => g.circleId === currentCircle.id);
  const circleVotes = votes.filter((v) => v.circleId === currentCircle.id);
  const circleAuditLogs = auditLogs.filter((a) => a.circleId === currentCircle.id);

  // Live Wallet & Financial Computations (Single Source of Truth)
  const totalContributions = circleTransactions
    .filter((t) => t.type === 'CONTRIBUTION')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = circleTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const tourExpenses = circleTransactions
    .filter((t) => t.type === 'EXPENSE' && (t.category === 'Tour' || t.category === 'Hotel' || t.category === 'Travel'))
    .reduce((sum, t) => sum + t.amount, 0);

  const foodExpenses = circleTransactions
    .filter((t) => t.type === 'EXPENSE' && t.category === 'Food')
    .reduce((sum, t) => sum + t.amount, 0);

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
  const currentBalance = totalContributions + loansPrincipalRepaid + interestEarned - totalExpenses - loansGiven;

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

  // Current Week Stats (Week 4)
  const currentWeekRecords = circleContributions.filter((c) => c.weekNumber === 4);
  const paidCount = currentWeekRecords.filter((c) => c.status === 'Paid').length;
  const pendingCount = currentWeekRecords.filter((c) => c.status !== 'Paid').length;

  const currentWeekStats = {
    weekLabel: 'Week 4 (Oct 22 - Oct 28)',
    paidCount: paidCount || 7,
    pendingCount: pendingCount || 3,
    totalExpected: (circleMembers.length || 10) * (currentCircle.contributionAmount || 500),
  };

  // Weekly Trend Chart Data
  const weeklyChartData = [
    { name: 'Wk 1', collected: 5000, target: 5000 },
    { name: 'Wk 2', collected: 5000, target: 5000 },
    { name: 'Wk 3', collected: 4500, target: 5000 },
    { name: 'Wk 4', collected: 3500, target: 5000 },
    { name: 'Wk 5', collected: 0, target: 5000 },
  ];

  // Expense breakdown chart data
  const expenseChartData = [
    { name: 'Hotel & Stay', value: 10000 },
    { name: 'Food & Meals', value: 4500 },
    { name: 'Transport & Fuel', value: 3000 },
    { name: 'Activities', value: 1500 },
  ];

  // Upcoming Tour
  const upcomingTour = circleTours[0] || null;

  // Sync with API on mount if server is available
  useEffect(() => {
    fetch('/api/circles')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setCircles(data);
        }
      })
      .catch(() => {
        // Fallback gracefully to local mock store
      });
  }, []);

  // Handlers for User & Circle Switching
  const handleSelectCircle = (circleId: string) => {
    setCurrentCircleId(circleId);
    showToast(`Switched to circle "${circles.find((c) => c.id === circleId)?.name}"`);
  };

  const handleSwitchUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
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
    weekNumber: number;
    amount: number;
    paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
    referenceNote: string;
    status: 'Paid' | 'Partially Paid' | 'Waived';
  }) => {
    const member = users.find((u) => u.id === data.userId);
    const memberName = member?.name || 'Squad Member';

    // 1. Update contribution records
    setContributions((prev) => {
      const existing = prev.find(
        (c) => c.circleId === currentCircle.id && c.userId === data.userId && c.weekNumber === data.weekNumber
      );
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                amount: data.amount,
                paidAmount: data.amount,
                status: data.status,
                paymentMethod: data.paymentMethod,
                referenceNote: data.referenceNote,
                paidDate: new Date().toISOString(),
                recordedBy: currentUser.name,
              }
            : c
        );
      } else {
        const newRecord: ContributionRecord = {
          id: `contrib-${Date.now()}`,
          circleId: currentCircle.id,
          userId: data.userId,
          userName: memberName,
          weekNumber: data.weekNumber,
          weekLabel: `Week ${data.weekNumber}`,
          dueDate: new Date().toISOString().split('T')[0],
          amount: data.amount,
          paidAmount: data.amount,
          status: data.status,
          paidDate: new Date().toISOString(),
          paymentMethod: data.paymentMethod,
          referenceNote: data.referenceNote,
          recordedBy: currentUser.name,
        };
        return [newRecord, ...prev];
      }
    });

    // 2. Append to double-entry Transaction Ledger
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      circleId: currentCircle.id,
      memberId: data.userId,
      memberName: memberName,
      amount: data.amount,
      type: 'CONTRIBUTION',
      category: 'Weekly Savings',
      date: new Date().toISOString(),
      reference: `UPI-SAV-${data.weekNumber}-${Date.now().toString().slice(-4)}`,
      createdBy: currentUser.name,
      notes: `Week ${data.weekNumber} savings contribution via ${data.paymentMethod}`,
      auditInfo: `Recorded by ${currentUser.name}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

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
        m.userId === data.userId && m.circleId === currentCircle.id
          ? { ...m, totalContributed: m.totalContributed + data.amount, pendingContribution: Math.max(0, m.pendingContribution - data.amount) }
          : m
      )
    );

    showToast(`Payment of ₹${data.amount} recorded for ${memberName}`);
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
    setExpenses((prev) => [newExpense, ...prev]);

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
    setTransactions((prev) => [newTx, ...prev]);

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
  }) => {
    const monthlyInterest = (data.principal * data.interestRate) / 100;
    const totalInterest = monthlyInterest * data.durationMonths;
    const totalRepayment = data.principal + totalInterest;

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
      dueDate: new Date(Date.now() + data.durationMonths * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      monthlyInterest,
      totalInterest,
      totalRepayment,
      principalPaid: 0,
      interestPaid: 0,
      totalPaid: 0,
      remainingAmount: totalRepayment,
      status: 'Pending',
      purpose: data.purpose,
      installments: Array.from({ length: data.durationMonths }).map((_, i) => ({
        installmentNumber: i + 1,
        dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        principalAmount: Math.round(data.principal / data.durationMonths),
        interestAmount: monthlyInterest,
        totalDue: Math.round(data.principal / data.durationMonths + monthlyInterest),
        paidAmount: 0,
        status: 'Pending',
      })),
    };

    setLoans((prev) => [newLoan, ...prev]);

    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      circleId: currentCircle.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Loan Requested',
      timestamp: new Date().toISOString(),
      newValue: `Requested ₹${data.principal} for "${data.purpose}" @ ${data.interestRate}%/mo`,
      ipInfo: '103.14.88.2 (Palakkad, IN)',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(`Peer loan request for ₹${data.principal} submitted for consensus approval`);
  };

  // Actions: Review Loan (Approve/Reject)
  const handleReviewLoan = (loanId: string, action: 'approve' | 'reject') => {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loanId) {
          return {
            ...l,
            status: action === 'approve' ? 'Active' : 'Rejected',
            reviewedBy: currentUser.name,
            reviewedDate: new Date().toISOString(),
          };
        }
        return l;
      })
    );

    const targetLoan = loans.find((l) => l.id === loanId);
    if (action === 'approve' && targetLoan) {
      // Disburse fund
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
        notes: `Disbursed ₹${targetLoan.principal} internal loan to ${targetLoan.borrowerName}`,
        auditInfo: `Approved by admin ${currentUser.name}`,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    showToast(`Loan ${action === 'approve' ? 'approved and disbursed' : 'declined'}`);
  };

  // Actions: Repay Loan Installment
  const handleRepayLoan = (data: {
    loanId: string;
    amount: number;
    principalAmount: number;
    interestAmount: number;
    paymentMethod: string;
  }) => {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === data.loanId) {
          const newPrincipalPaid = l.principalPaid + data.principalAmount;
          const newInterestPaid = l.interestPaid + data.interestAmount;
          const newTotalPaid = l.totalPaid + data.amount;
          const newRemaining = Math.max(0, l.totalRepayment - newTotalPaid);
          const isFullyRepaid = newRemaining <= 0;

          return {
            ...l,
            principalPaid: newPrincipalPaid,
            interestPaid: newInterestPaid,
            totalPaid: newTotalPaid,
            remainingAmount: newRemaining,
            status: isFullyRepaid ? 'Repaid' : 'Active',
          };
        }
        return l;
      })
    );

    // Ledger entry for principal return
    const txPrincipal: Transaction = {
      id: `tx-rep-p-${Date.now()}`,
      circleId: currentCircle.id,
      amount: data.principalAmount,
      type: 'LOAN_PRINCIPAL_REPAYMENT',
      category: 'Loan Principal Return',
      date: new Date().toISOString(),
      reference: `LOAN-REP-P-${Date.now().toString().slice(-4)}`,
      createdBy: currentUser.name,
      notes: `Loan installment principal return`,
      auditInfo: `Credited back to circle capital fund`,
    };

    // Ledger entry for interest earned
    const txInterest: Transaction = {
      id: `tx-rep-i-${Date.now()}`,
      circleId: currentCircle.id,
      amount: data.interestAmount,
      type: 'INTEREST_PAYMENT',
      category: 'Circle Interest Income',
      date: new Date().toISOString(),
      reference: `LOAN-INT-${Date.now().toString().slice(-4)}`,
      createdBy: currentUser.name,
      notes: `Interest income from loan installment`,
      auditInfo: `Earned interest added to common group pool`,
    };

    setTransactions((prev) => [txInterest, txPrincipal, ...prev]);
    showToast(`Loan installment of ₹${data.amount} (Principal ₹${data.principalAmount} + Interest ₹${data.interestAmount}) recorded!`);
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

    setTours((prev) => [newTour, ...prev]);

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
    setVotes((prev) => [newVote, ...prev]);

    showToast(`Tour plan "${data.title}" created with consensus poll`);
  };

  // Actions: Add Member
  const handleAddMember = (data: {
    name: string;
    phone: string;
    email: string;
    role: 'circle_admin' | 'member';
  }) => {
    const newUserId = `user-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name: data.name,
      email: data.email,
      phone: data.phone,
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
      email: data.email,
      phone: data.phone,
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
  }) => {
    const newCircleId = `circle-${Date.now()}`;
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
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      planTier: 'free',
    };

    setCircles((prev) => [...prev, newCircle]);
    setCurrentCircleId(newCircleId);

    // Add current user as admin of new circle
    const newAdminMember: CircleMember = {
      id: `cm-admin-${Date.now()}`,
      userId: currentUser.id,
      circleId: newCircleId,
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      avatarUrl: currentUser.avatarUrl,
      role: 'circle_admin',
      joinedDate: new Date().toISOString().split('T')[0],
      totalContributed: 0,
      totalReceived: 0,
      pendingContribution: data.contributionAmount,
      outstandingLoan: 0,
      loanRepaymentStatus: 'none',
    };
    setMembers((prev) => [...prev, newAdminMember]);

    showToast(`Circle "${data.name}" created! You are now managing this squad.`);
  };

  // Actions: Voting
  const handleCastVote = (voteId: string, optionId: string) => {
    setVotes((prev) =>
      prev.map((v) => {
        if (v.id === voteId) {
          const updatedOptions = v.options.map((opt) => {
            const hasVoted = opt.voterIds.includes(currentUser.id);
            if (opt.id === optionId) {
              if (hasVoted) return opt; // already voted
              return {
                ...opt,
                votesCount: opt.votesCount + 1,
                voterIds: [...opt.voterIds, currentUser.id],
              };
            } else {
              // Remove vote if switching
              if (hasVoted) {
                return {
                  ...opt,
                  votesCount: Math.max(0, opt.votesCount - 1),
                  voterIds: opt.voterIds.filter((id) => id !== currentUser.id),
                };
              }
              return opt;
            }
          });
          return { ...v, options: updatedOptions };
        }
        return v;
      })
    );
    showToast('Your vote has been recorded on this proposal');
  };

  const handleCreateVote = (data: {
    title: string;
    description: string;
    deadline: string;
    thresholdPercentage: number;
  }) => {
    const newVote: Vote = {
      id: `vote-${Date.now()}`,
      circleId: currentCircle.id,
      title: data.title,
      description: data.description,
      category: 'Rule Change',
      options: [
        { id: `opt-1-${Date.now()}`, text: '👍 Yes, approve proposal', votesCount: 1, voterIds: [currentUser.id] },
        { id: `opt-2-${Date.now()}`, text: '👎 Reject proposal', votesCount: 0, voterIds: [] },
      ],
      status: 'active',
      deadline: data.deadline,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
      thresholdPercentage: data.thresholdPercentage,
    };
    setVotes((prev) => [newVote, ...prev]);
    showToast('Consensus proposal published to circle');
  };

  // Actions: Goals
  const handleAddGoal = (data: { title: string; targetAmount: number; targetDate: string; category: string }) => {
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
    setGoals((prev) => [newGoal, ...prev]);
    showToast(`Savings target "${data.title}" added`);
  };

  const handleAllocateFund = (goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );
    showToast(`Allocated ₹${amount} towards goal`);
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
      createdBy: currentUser.name,
      notes: data.reason,
      auditInfo: `Ledger manual reconciliation entry`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Ledger adjustment of ₹${data.amount} recorded`);
  };

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
        allUsers={users}
        circles={circles}
        currentCircle={currentCircle}
        notifications={notifications}
        onSelectCircle={handleSelectCircle}
        onSwitchUser={handleSwitchUser}
        onOpenCreateCircle={() => setIsCreateCircleOpen(true)}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLoginModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          userRole={currentUser.role}
          unreadCount={notifications.filter((n) => !n.isRead).length}
        />

        {/* Main Content Stage */}
        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8 min-w-0 max-w-full">
          {activeTab === 'dashboard' && (
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
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenRecordPaymentModal={() => setIsRecordPaymentOpen(true)}
              onOpenAddExpenseModal={() => setIsAddExpenseOpen(true)}
              onOpenRequestLoanModal={() => setIsRequestLoanOpen(true)}
              onOpenTourProposalModal={() => setIsTourProposalOpen(true)}
            />
          )}

          {activeTab === 'savings' && (
            <SavingsTab
              circle={currentCircle}
              currentUser={currentUser}
              contributions={circleContributions}
              onRecordPayment={handleRecordPayment}
              onOpenRecordModal={() => setIsRecordPaymentOpen(true)}
            />
          )}

          {activeTab === 'ledger' && (
            <LedgerTab
              circle={currentCircle}
              currentUser={currentUser}
              transactions={circleTransactions}
              wallet={wallet}
              onAddAdjustment={handleAddAdjustment}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesTab
              circle={currentCircle}
              currentUser={currentUser}
              expenses={circleExpenses}
              tours={circleTours}
              onAddExpense={handleAddExpense}
              onOpenAddModal={() => setIsAddExpenseOpen(true)}
            />
          )}

          {activeTab === 'tours' && (
            <ToursTab
              circle={currentCircle}
              currentUser={currentUser}
              tours={circleTours}
              onOpenCreateModal={() => setIsTourProposalOpen(true)}
            />
          )}

          {activeTab === 'loans' && (
            <LoansTab
              circle={currentCircle}
              currentUser={currentUser}
              loans={circleLoans}
              interestEarnedTotal={interestEarned}
              onRequestLoan={handleRequestLoan}
              onReviewLoan={handleReviewLoan}
              onRepayLoan={handleRepayLoan}
              onOpenRequestModal={() => setIsRequestLoanOpen(true)}
            />
          )}

          {activeTab === 'members' && (
            <MembersTab
              circle={currentCircle}
              currentUser={currentUser}
              members={circleMembers}
              onAddMember={handleAddMember}
              onOpenAddModal={() => setIsAddMemberOpen(true)}
              onSelectMemberForPayment={(m) => {
                setSelectedMemberForPayment(m.userId);
                setIsRecordPaymentOpen(true);
              }}
              onUpdateRole={handleUpdateMemberRole}
              onRemoveMember={handleRemoveMember}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsTab
              circle={currentCircle}
              currentUser={currentUser}
              goals={circleGoals}
              onAddGoal={handleAddGoal}
              onAllocateFund={handleAllocateFund}
            />
          )}

          {activeTab === 'voting' && (
            <VotingTab
              circle={currentCircle}
              currentUser={currentUser}
              votes={circleVotes}
              onCastVote={handleCastVote}
              onCreateVote={handleCreateVote}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab
              circle={currentCircle}
              contributions={circleContributions}
              expenses={circleExpenses}
              loans={circleLoans}
              tours={circleTours}
              transactions={circleTransactions}
              wallet={wallet}
            />
          )}

          {activeTab === 'audit' && <AuditLogTab logs={circleAuditLogs} />}

          {activeTab === 'profile' && (
            <MemberProfileView
              currentUser={currentUser}
              circle={currentCircle}
              contributions={circleContributions}
              loans={circleLoans}
              tours={circleTours}
            />
          )}

          {activeTab === 'superadmin' && <SuperAdminTab circles={circles} users={users} />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        currentUser={currentUser}
        unreadCount={notifications.filter((n) => !n.isRead).length}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenMoreMenu={() => setShowMobileMoreMenu(true)}
      />

      {/* Mobile More Actions Drawer Modal */}
      {showMobileMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white rounded-t-3xl max-w-lg w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-base">BuddyFund Modules</span>
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
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowMobileMoreMenu(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      <CreateCircleModal
        isOpen={isCreateCircleOpen}
        onClose={() => setIsCreateCircleOpen(false)}
        onCreate={handleCreateCircle}
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
    </div>
  );
}
