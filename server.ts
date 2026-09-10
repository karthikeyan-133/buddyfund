import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_USERS,
  INITIAL_CIRCLES,
  INITIAL_MEMBERS,
  INITIAL_CONTRIBUTIONS,
  INITIAL_EXPENSES,
  INITIAL_TOURS,
  INITIAL_LOANS,
  INITIAL_TRANSACTIONS,
  INITIAL_GOALS,
  INITIAL_VOTES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './src/data/initialData.ts';
import {
  User,
  Circle,
  CircleMember,
  ContributionRecord,
  Expense,
  Tour,
  Loan,
  Transaction,
  Goal,
  Vote,
  AppNotification,
  AuditLog,
} from './src/types.ts';

// In-Memory Database Storage
let users: User[] = [...INITIAL_USERS];
let circles: Circle[] = [...INITIAL_CIRCLES];
let circleMembers: CircleMember[] = [...INITIAL_MEMBERS];
let contributions: ContributionRecord[] = [...INITIAL_CONTRIBUTIONS];
let expenses: Expense[] = [...INITIAL_EXPENSES];
let tours: Tour[] = [...INITIAL_TOURS];
let loans: Loan[] = [...INITIAL_LOANS];
let transactions: Transaction[] = [...INITIAL_TRANSACTIONS];
let goals: Goal[] = [...INITIAL_GOALS];
let votes: Vote[] = [...INITIAL_VOTES];
let notifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];
let auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];

// Current logged in user (defaults to Karthik Raja)
let currentUserId = 'user-karthik';

// Helper: Calculate double-entry balance for a circle
function calculateCircleBalance(circleId: string) {
  const circleTx = transactions.filter((t) => t.circleId === circleId);

  let totalContributions = 0;
  let totalExpenses = 0;
  let tourExpenses = 0;
  let foodExpenses = 0;
  let loansGiven = 0;
  let loansPrincipalRepaid = 0;
  let interestEarned = 0;
  let otherIncome = 0;

  circleTx.forEach((tx) => {
    switch (tx.type) {
      case 'CONTRIBUTION':
        totalContributions += tx.amount;
        break;
      case 'EXPENSE':
        totalExpenses += tx.amount;
        if (tx.category === 'Hotel' || tx.category === 'Travel' || tx.category === 'Tickets') {
          tourExpenses += tx.amount;
        } else if (tx.category === 'Food') {
          foodExpenses += tx.amount;
        }
        break;
      case 'LOAN_DISBURSEMENT':
        loansGiven += tx.amount;
        break;
      case 'LOAN_PRINCIPAL_REPAYMENT':
        loansPrincipalRepaid += tx.amount;
        break;
      case 'INTEREST_PAYMENT':
        interestEarned += tx.amount;
        break;
      case 'OTHER_INCOME':
      case 'REFUND':
        otherIncome += tx.amount;
        break;
      case 'ADJUSTMENT':
        // can be positive or negative
        break;
    }
  });

  // Strict double-entry calculated cash pool balance
  const currentBalance =
    totalContributions +
    interestEarned +
    loansPrincipalRepaid +
    otherIncome -
    totalExpenses -
    loansGiven;

  const activeLoans = loans.filter((l) => l.circleId === circleId && l.status === 'Active');
  const activeLoanOutstanding = activeLoans.reduce((sum, l) => sum + l.remainingAmount, 0);

  return {
    currentBalance: Math.max(0, currentBalance),
    totalContributions,
    totalExpenses,
    tourExpenses,
    foodExpenses,
    loansGiven,
    loansPrincipalRepaid,
    interestEarned,
    activeLoanOutstanding,
    activeLoanCount: activeLoans.length,
  };
}

// Log audit helper
function recordAudit(circleId: string, action: string, oldValue?: string, newValue?: string) {
  const user = users.find((u) => u.id === currentUserId);
  const newLog: AuditLog = {
    id: `audit-${Date.now()}`,
    circleId,
    userId: currentUserId,
    userName: user?.name || 'Authorized Member',
    action,
    timestamp: new Date().toISOString(),
    oldValue,
    newValue,
    ipInfo: '103.14.88.2 (Secure Verified Session)',
  };
  auditLogs.unshift(newLog);
  return newLog;
}

// Push notification helper
function sendNotification(circleId: string, title: string, message: string, type: AppNotification['type'], linkToTab?: string, targetUserId?: string) {
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    circleId,
    userId: targetUserId || currentUserId,
    title,
    message,
    type,
    date: new Date().toISOString(),
    isRead: false,
    linkToTab,
  };
  notifications.unshift(newNotif);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==================== AUTH & USER ROUTES ====================
  app.get('/api/auth/me', (req, res) => {
    const user = users.find((u) => u.id === currentUserId) || users[0] || null;
    res.json({
      user,
      allAvailableUsers: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatarUrl: u.avatarUrl,
        circleIds: u.circleIds,
      })),
    });
  });

  app.post('/api/auth/switch-user', (req, res) => {
    const { userId } = req.body;
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }
    currentUserId = target.id;
    res.json({ success: true, user: target });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
    if (user) {
      currentUserId = user.id;
      return res.json({ success: true, user });
    }
    // Create new quick session member
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      phone: '+91 99999 00000',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      role: 'member',
      joinedDate: new Date().toISOString().split('T')[0],
      circleIds: ['circle-palakkad-2026'],
      isVerified: true,
      status: 'active',
    };
    users.push(newUser);
    currentUserId = newUser.id;
    res.json({ success: true, user: newUser });
  });

  app.post('/api/auth/verify-otp', (req, res) => {
    const { otp } = req.body;
    if (otp === '123456' || otp?.length === 6) {
      const user = users.find((u) => u.id === currentUserId) || users[0];
      user.isVerified = true;
      return res.json({ success: true, verified: true, user });
    }
    res.status(400).json({ error: 'Invalid OTP. Please enter 123456 or a valid 6-digit code.' });
  });

  // ==================== CIRCLES ROUTES ====================
  app.get('/api/circles', (req, res) => {
    const currentUser = users.find((u) => u.id === currentUserId);
    if (!currentUser) return res.json({ circles: [] });

    if (currentUser.role === 'super_admin') {
      return res.json({ circles });
    }

    const memberCircles = circles.filter(
      (c) => currentUser.circleIds.includes(c.id) || c.createdBy === currentUser.id
    );
    res.json({ circles: memberCircles });
  });

  app.get('/api/circles/:id', (req, res) => {
    const circle = circles.find((c) => c.id === req.params.id);
    if (!circle) return res.status(404).json({ error: 'Circle not found' });
    res.json({ circle });
  });

  app.post('/api/circles', (req, res) => {
    const {
      name,
      description,
      photoUrl,
      currency,
      contributionFrequency,
      contributionAmount,
      contributionDay,
      startDate,
      expectedMembers,
      rules,
    } = req.body;

    const newCircleId = `circle-${Date.now()}`;
    const currentUser = users.find((u) => u.id === currentUserId);

    const newCircle: Circle = {
      id: newCircleId,
      name: name || 'Friends Circle Group',
      description: description || 'Private mutual group savings and adventures',
      photoUrl:
        photoUrl ||
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
      currency: currency || 'INR',
      currencySymbol: currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹',
      contributionFrequency: contributionFrequency || 'weekly',
      contributionAmount: Number(contributionAmount) || 500,
      contributionDay: contributionDay || 'Sunday',
      startDate: startDate || new Date().toISOString().split('T')[0],
      expectedMembers: Number(expectedMembers) || 8,
      rules: Array.isArray(rules) && rules.length > 0 ? rules : [
        `Contribute ${currency === 'USD' ? '$' : '₹'}${contributionAmount || 500} every ${contributionDay || 'Sunday'}.`,
        'Transparent ledger visible to all circle members.',
        'Loans subject to group agreement.',
      ],
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      planTier: 'free',
    };

    circles.unshift(newCircle);

    // Add current user as admin member
    if (currentUser) {
      currentUser.circleIds.push(newCircleId);
      const adminMember: CircleMember = {
        id: `cm-${Date.now()}`,
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
        pendingContribution: Number(contributionAmount) || 500,
        outstandingLoan: 0,
        loanRepaymentStatus: 'none',
      };
      circleMembers.push(adminMember);

      // Automatically generate first 4 weeks contribution schedule for founder
      for (let w = 1; w <= 4; w++) {
        const d = new Date();
        d.setDate(d.getDate() + w * 7);
        contributions.push({
          id: `c-new-${Date.now()}-${w}`,
          circleId: newCircleId,
          userId: currentUser.id,
          userName: currentUser.name,
          weekNumber: w,
          weekLabel: `Week ${w}`,
          dueDate: d.toISOString().split('T')[0],
          amount: Number(contributionAmount) || 500,
          paidAmount: 0,
          status: 'Pending',
        });
      }
    }

    recordAudit(newCircleId, 'Circle Created', 'None', `Created circle "${newCircle.name}"`);
    sendNotification(newCircleId, 'New Circle Created', `Circle "${newCircle.name}" created with ${newCircle.currencySymbol}${newCircle.contributionAmount} ${newCircle.contributionFrequency} savings.`, 'general');

    res.status(201).json({ success: true, circle: newCircle });
  });

  // ==================== DASHBOARD SUMMARY ====================
  app.get('/api/circles/:id/dashboard-summary', (req, res) => {
    const circleId = req.params.id;
    const circle = circles.find((c) => c.id === circleId);
    if (!circle) return res.status(404).json({ error: 'Circle not found' });

    const balanceData = calculateCircleBalance(circleId);
    const members = circleMembers.filter((cm) => cm.circleId === circleId);
    const circleContributions = contributions.filter((c) => c.circleId === circleId);
    const circleLoans = loans.filter((l) => l.circleId === circleId);
    const circleExpenses = expenses.filter((e) => e.circleId === circleId);
    const circleTours = tours.filter((t) => t.circleId === circleId);
    const circleGoals = goals.filter((g) => g.circleId === circleId);
    const circleVotes = votes.filter((v) => v.circleId === circleId);

    // Week 3/current week payment breakdown
    const currentWeekContr = circleContributions.filter((c) => c.weekNumber === 3 || c.weekLabel === 'Week 3');
    const paidCount = currentWeekContr.filter((c) => c.status === 'Paid').length;
    const pendingCount = currentWeekContr.filter((c) => c.status === 'Pending').length;

    // Next upcoming tour
    const upcomingTour = circleTours[0] || null;

    // Weekly savings chart data (weeks 1 to 4)
    const weeklyChartData = [
      {
        name: 'Week 1',
        collected: circleContributions.filter((c) => c.weekNumber === 1 && c.status === 'Paid').reduce((s, c) => s + c.paidAmount, 0),
        target: circle.expectedMembers * circle.contributionAmount,
      },
      {
        name: 'Week 2',
        collected: circleContributions.filter((c) => c.weekNumber === 2 && c.status === 'Paid').reduce((s, c) => s + c.paidAmount, 0),
        target: circle.expectedMembers * circle.contributionAmount,
      },
      {
        name: 'Week 3',
        collected: circleContributions.filter((c) => c.weekNumber === 3 && c.status === 'Paid').reduce((s, c) => s + c.paidAmount, 0),
        target: circle.expectedMembers * circle.contributionAmount,
      },
      {
        name: 'Week 4',
        collected: circleContributions.filter((c) => c.weekNumber === 4 && c.status === 'Paid').reduce((s, c) => s + c.paidAmount, 0),
        target: circle.expectedMembers * circle.contributionAmount,
      },
    ];

    // Expense breakdown by category for donut chart
    const categoryTotals: Record<string, number> = {};
    circleExpenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    const expenseChartData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));

    res.json({
      circle,
      wallet: balanceData,
      memberCount: members.length,
      currentWeek: {
        weekLabel: 'Week 3',
        paidCount,
        pendingCount,
        totalExpected: (members.length || circle.expectedMembers) * circle.contributionAmount,
      },
      upcomingTour,
      goalsCount: circleGoals.length,
      activeVotesCount: circleVotes.filter((v) => v.status === 'active').length,
      weeklyChartData,
      expenseChartData,
    });
  });

  // ==================== MEMBERS ====================
  app.get('/api/circles/:id/members', (req, res) => {
    const members = circleMembers.filter((m) => m.circleId === req.params.id);
    res.json({ members });
  });

  app.post('/api/circles/:id/members', (req, res) => {
    const circleId = req.params.id;
    const { name, email, phone, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const newMemberId = `cm-${Date.now()}`;
    const newUserId = `user-${Date.now()}`;

    const newMember: CircleMember = {
      id: newMemberId,
      userId: newUserId,
      circleId,
      name,
      email,
      phone: phone || '+91 98000 00000',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      role: role === 'circle_admin' ? 'circle_admin' : 'member',
      joinedDate: new Date().toISOString().split('T')[0],
      totalContributed: 0,
      totalReceived: 0,
      pendingContribution: 500,
      outstandingLoan: 0,
      loanRepaymentStatus: 'none',
    };

    circleMembers.push(newMember);

    // Also register basic user in users list
    users.push({
      id: newUserId,
      name,
      email,
      phone: phone || '+91 98000 00000',
      avatarUrl: newMember.avatarUrl,
      role: role === 'circle_admin' ? 'circle_admin' : 'member',
      joinedDate: new Date().toISOString().split('T')[0],
      circleIds: [circleId],
      isVerified: true,
      status: 'active',
    });

    // Generate upcoming contributions for this new member
    for (let w = 3; w <= 6; w++) {
      contributions.push({
        id: `c-${Date.now()}-${w}`,
        circleId,
        userId: newUserId,
        userName: name,
        weekNumber: w,
        weekLabel: `Week ${w}`,
        dueDate: `2026-10-${w * 7}`,
        amount: 500,
        paidAmount: 0,
        status: 'Pending',
      });
    }

    recordAudit(circleId, 'Member Added', 'None', `Added ${name} (${role || 'member'}) to circle.`);
    sendNotification(circleId, 'New Member Joined', `${name} joined the circle squad!`, 'general');

    res.status(201).json({ success: true, member: newMember });
  });

  // ==================== WEEKLY CONTRIBUTIONS ====================
  app.get('/api/circles/:id/contributions', (req, res) => {
    const list = contributions.filter((c) => c.circleId === req.params.id);
    res.json({ contributions: list });
  });

  app.post('/api/circles/:id/contributions/record', (req, res) => {
    const circleId = req.params.id;
    const {
      recordId,
      userId,
      amount,
      paymentMethod,
      referenceNote,
      status,
      weekNumber,
    } = req.body;

    let target = contributions.find((c) => c.id === recordId);

    if (!target && userId && weekNumber) {
      target = contributions.find(
        (c) => c.circleId === circleId && c.userId === userId && c.weekNumber === Number(weekNumber)
      );
    }

    if (!target) {
      return res.status(404).json({ error: 'Contribution schedule slot not found' });
    }

    const prevStatus = target.status;
    const paidAmt = Number(amount) || target.amount;

    target.status = status || 'Paid';
    target.paidAmount = target.status === 'Paid' ? paidAmt : target.status === 'Partially Paid' ? paidAmt : 0;
    target.paidDate = new Date().toISOString().split('T')[0];
    target.paymentMethod = paymentMethod || 'UPI';
    target.referenceNote = referenceNote || `Ref: ${paymentMethod || 'UPI'}-${Date.now().toString().slice(-4)}`;
    target.recordedBy = currentUserId;

    // Update circle member aggregated stats
    const member = circleMembers.find((m) => m.circleId === circleId && m.userId === target?.userId);
    if (member && target.status === 'Paid') {
      member.totalContributed += paidAmt;
      member.pendingContribution = Math.max(0, member.pendingContribution - paidAmt);
    }

    // Double-entry ledger entry
    const newTx: Transaction = {
      id: `tx-contr-${Date.now()}`,
      circleId,
      memberId: target.userId,
      memberName: target.userName,
      amount: paidAmt,
      type: 'CONTRIBUTION',
      category: 'Weekly Savings',
      date: new Date().toISOString(),
      reference: target.referenceNote,
      createdBy: users.find((u) => u.id === currentUserId)?.name || 'Admin',
      notes: `${target.userName} paid ${target.weekLabel} contribution (${paymentMethod || 'UPI'})`,
      auditInfo: `Recorded by Circle Admin on ${new Date().toLocaleDateString()}`,
    };
    transactions.unshift(newTx);

    recordAudit(
      circleId,
      'Contribution Payment Recorded',
      `${target.userName} ${target.weekLabel}: ${prevStatus}`,
      `Marked ${target.status} (₹${paidAmt} via ${paymentMethod || 'UPI'})`
    );

    sendNotification(
      circleId,
      'Contribution Received',
      `₹${paidAmt} contribution recorded for ${target.userName} (${target.weekLabel}).`,
      'payment_received',
      'savings',
      target.userId
    );

    res.json({ success: true, contribution: target, transaction: newTx });
  });

  // ==================== EXPENSES ====================
  app.get('/api/circles/:id/expenses', (req, res) => {
    const list = expenses.filter((e) => e.circleId === req.params.id);
    res.json({ expenses: list });
  });

  app.post('/api/circles/:id/expenses', (req, res) => {
    const circleId = req.params.id;
    const {
      title,
      amount,
      date,
      category,
      paidBy,
      description,
      receiptUrl,
      participants,
      tourId,
      notes,
    } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ error: 'Title and amount are required' });
    }

    const expenseAmount = Number(amount);
    const tour = tourId ? tours.find((t) => t.id === tourId) : undefined;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      circleId,
      title,
      amount: expenseAmount,
      date: date || new Date().toISOString().split('T')[0],
      category: category || 'Other',
      paidBy: paidBy || 'Circle Fund',
      description: description || '',
      receiptUrl:
        receiptUrl ||
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
      participants: participants || ['All Members'],
      tourId: tour?.id,
      tourName: tour?.title,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    expenses.unshift(newExpense);

    // If linked to a tour, update actual spent on tour breakdown
    if (tour) {
      const matchCat = tour.budgetBreakdown.find(
        (b) => b.category.toLowerCase() === (category || '').toLowerCase()
      );
      if (matchCat) {
        matchCat.actualSpent += expenseAmount;
      }
    }

    // Record immutable ledger entry
    const newTx: Transaction = {
      id: `tx-exp-${Date.now()}`,
      circleId,
      amount: expenseAmount,
      type: 'EXPENSE',
      category: category || 'Other',
      date: new Date().toISOString(),
      reference: `EXP-${Date.now().toString().slice(-6)}`,
      createdBy: users.find((u) => u.id === currentUserId)?.name || 'Admin',
      notes: `${title} - ${description || 'Group expense'}${tour ? ` (${tour.title})` : ''}`,
      receiptUrl: newExpense.receiptUrl,
      auditInfo: `Authorized expense from ${paidBy || 'Circle Fund'}`,
    };
    transactions.unshift(newTx);

    recordAudit(circleId, 'Expense Created', 'None', `Created expense "${title}" for ₹${expenseAmount} (${category})`);
    sendNotification(circleId, 'New Expense Recorded', `₹${expenseAmount} spent on ${title} (${category}).`, 'general', 'expenses');

    res.status(201).json({ success: true, expense: newExpense, transaction: newTx });
  });

  // ==================== TOURS & TOUR BUDGET ====================
  app.get('/api/circles/:id/tours', (req, res) => {
    const list = tours.filter((t) => t.circleId === req.params.id);
    res.json({ tours: list });
  });

  app.post('/api/circles/:id/tours', (req, res) => {
    const circleId = req.params.id;
    const {
      title,
      destination,
      duration,
      startDate,
      endDate,
      estimatedBudget,
      allocatedFromCircle,
      budgetBreakdown,
      attendingMemberIds,
      bannerUrl,
      notes,
    } = req.body;

    const newTour: Tour = {
      id: `tour-${Date.now()}`,
      circleId,
      title: title || 'New Friends Trip',
      destination: destination || 'Goa, India',
      duration: duration || '3 Days / 2 Nights',
      startDate: startDate || '2027-02-10',
      endDate: endDate || '2027-02-13',
      estimatedBudget: Number(estimatedBudget) || 50000,
      allocatedFromCircle: Number(allocatedFromCircle) || 20000,
      status: 'planning',
      bannerUrl:
        bannerUrl ||
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
      budgetBreakdown:
        budgetBreakdown || [
          { category: 'Travel', allocated: Math.round(Number(estimatedBudget || 50000) * 0.35), actualSpent: 0 },
          { category: 'Hotel', allocated: Math.round(Number(estimatedBudget || 50000) * 0.3), actualSpent: 0 },
          { category: 'Food', allocated: Math.round(Number(estimatedBudget || 50000) * 0.2), actualSpent: 0 },
          { category: 'Activities', allocated: Math.round(Number(estimatedBudget || 50000) * 0.15), actualSpent: 0 },
        ],
      attendingMemberIds: attendingMemberIds || circleMembers.map((m) => m.userId),
      itinerary: [
        { day: 1, title: 'Arrival & Welcome Party', description: 'Group arrival, hotel check-in and evening reunion.' },
        { day: 2, title: 'Sightseeing & Adventures', description: 'Explore local attractions, shared lunch, and sunset beach walk.' },
        { day: 3, title: 'Souvenirs & Departure', description: 'Group photos, local cafe breakfast, and check-out.' },
      ],
      documents: [{ title: 'Trip Planning Draft', url: '#', type: 'PDF' }],
      notes: notes || 'Tour proposal created by circle member.',
    };

    tours.unshift(newTour);

    recordAudit(circleId, 'Tour Proposal Created', 'None', `Created "${newTour.title}" with budget ₹${newTour.estimatedBudget}`);
    sendNotification(circleId, 'New Tour Proposal', `Proposal created for ${newTour.title}! Check the budget & itinerary.`, 'tour_update', 'tours');

    res.status(201).json({ success: true, tour: newTour });
  });

  // ==================== INTERNAL LOANS SYSTEM ====================
  app.get('/api/circles/:id/loans', (req, res) => {
    const list = loans.filter((l) => l.circleId === req.params.id);
    res.json({ loans: list });
  });

  app.post('/api/circles/:id/loans/request', (req, res) => {
    const circleId = req.params.id;
    const { principal, interestRate, durationMonths, purpose } = req.body;

    const user = users.find((u) => u.id === currentUserId) || users[0];
    const p = Number(principal) || 5000;
    const r = Number(interestRate) || 2; // 2% per month
    const m = Number(durationMonths) || 3;

    // Monthly interest: p * (r / 100)
    const monthlyInt = Math.round(p * (r / 100));
    const totalInt = monthlyInt * m;
    const totalRepay = p + totalInt;

    const startDate = new Date().toISOString().split('T')[0];
    const due = new Date();
    due.setMonth(due.getMonth() + m);
    const dueDate = due.toISOString().split('T')[0];

    const installments = [];
    const monthlyPrincipal = Math.round(p / m);
    for (let i = 1; i <= m; i++) {
      const instDue = new Date();
      instDue.setMonth(instDue.getMonth() + i);
      installments.push({
        installmentNumber: i,
        dueDate: instDue.toISOString().split('T')[0],
        principalAmount: monthlyPrincipal,
        interestAmount: monthlyInt,
        totalDue: monthlyPrincipal + monthlyInt,
        paidAmount: 0,
        status: 'Pending' as const,
      });
    }

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      circleId,
      borrowerId: user.id,
      borrowerName: user.name,
      borrowerAvatar: user.avatarUrl,
      principal: p,
      interestRate: r,
      interestType: 'Monthly',
      durationMonths: m,
      startDate,
      dueDate,
      monthlyInterest: monthlyInt,
      totalInterest: totalInt,
      totalRepayment: totalRepay,
      principalPaid: 0,
      interestPaid: 0,
      totalPaid: 0,
      remainingAmount: totalRepay,
      status: 'Pending',
      purpose: purpose || 'Personal emergency support',
      installments,
    };

    loans.unshift(newLoan);

    recordAudit(circleId, 'Loan Requested', 'None', `${user.name} requested ₹${p} loan for ${m} months @ ${r}%/mo`);
    sendNotification(circleId, 'Loan Request Submitted', `${user.name} requested an internal loan of ₹${p}. Circle Admin review required.`, 'general', 'loans');

    res.status(201).json({ success: true, loan: newLoan });
  });

  app.post('/api/circles/:id/loans/:loanId/review', (req, res) => {
    const { loanId } = req.params;
    const { action } = req.body; // 'approve' | 'reject'

    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    const adminUser = users.find((u) => u.id === currentUserId);
    loan.reviewedBy = adminUser?.name || 'Circle Admin';
    loan.reviewedDate = new Date().toISOString().split('T')[0];

    if (action === 'approve') {
      loan.status = 'Active';

      // Record disbursement in ledger
      const newTx: Transaction = {
        id: `tx-disb-${Date.now()}`,
        circleId: loan.circleId,
        memberId: loan.borrowerId,
        memberName: loan.borrowerName,
        amount: loan.principal,
        type: 'LOAN_DISBURSEMENT',
        category: 'Internal Loan',
        date: new Date().toISOString(),
        reference: `LOAN-DISB-${loan.id.slice(-4)}`,
        createdBy: adminUser?.name || 'Admin',
        notes: `Disbursed internal loan to ${loan.borrowerName} (₹${loan.principal} @ ${loan.interestRate}%/mo)`,
        auditInfo: 'Approved by Circle Admin with compliance notice acknowledged',
      };
      transactions.unshift(newTx);

      // Update borrower member record
      const member = circleMembers.find((m) => m.circleId === loan.circleId && m.userId === loan.borrowerId);
      if (member) {
        member.totalReceived += loan.principal;
        member.outstandingLoan = loan.remainingAmount;
        member.loanRepaymentStatus = 'good';
      }

      recordAudit(loan.circleId, 'Loan Approved & Disbursed', 'Pending', `Disbursed ₹${loan.principal} to ${loan.borrowerName}`);
      sendNotification(loan.circleId, 'Loan Approved', `Your loan of ₹${loan.principal} has been approved and disbursed from Circle Fund.`, 'general', 'loans', loan.borrowerId);
    } else {
      loan.status = 'Rejected';
      recordAudit(loan.circleId, 'Loan Rejected', 'Pending', `Rejected loan for ${loan.borrowerName}`);
      sendNotification(loan.circleId, 'Loan Request Declined', `Your loan request for ₹${loan.principal} was not approved.`, 'general', 'loans', loan.borrowerId);
    }

    res.json({ success: true, loan });
  });

  app.post('/api/circles/:id/loans/:loanId/repay', (req, res) => {
    const { loanId } = req.params;
    const { amount, principalAmount, interestAmount, paymentMethod } = req.body;

    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    const totalAmt = Number(amount) || 1000;
    const pAmt = Number(principalAmount) || Math.round(totalAmt * 0.9);
    const iAmt = Number(interestAmount) || totalAmt - pAmt;

    loan.principalPaid += pAmt;
    loan.interestPaid += iAmt;
    loan.totalPaid += totalAmt;
    loan.remainingAmount = Math.max(0, loan.remainingAmount - totalAmt);

    if (loan.remainingAmount <= 0) {
      loan.status = 'Repaid';
    }

    // Mark corresponding installment paid
    const openInst = loan.installments.find((inst) => inst.status === 'Pending');
    if (openInst) {
      openInst.status = 'Paid';
      openInst.paidAmount = totalAmt;
      openInst.paidDate = new Date().toISOString().split('T')[0];
    }

    // 1. Transaction for Principal -> returns to Circle Fund
    transactions.unshift({
      id: `tx-prep-${Date.now()}`,
      circleId: loan.circleId,
      memberId: loan.borrowerId,
      memberName: loan.borrowerName,
      amount: pAmt,
      type: 'LOAN_PRINCIPAL_REPAYMENT',
      category: 'Loan Principal Return',
      date: new Date().toISOString(),
      reference: `LOAN-REP-P-${Date.now().toString().slice(-4)}`,
      createdBy: users.find((u) => u.id === currentUserId)?.name || loan.borrowerName,
      notes: `Loan principal repayment from ${loan.borrowerName} (${paymentMethod || 'UPI'})`,
      auditInfo: 'Directly returned to Circle Common Fund capital',
    });

    // 2. Transaction for Interest -> Circle Interest Income pool
    transactions.unshift({
      id: `tx-irep-${Date.now() + 1}`,
      circleId: loan.circleId,
      memberId: loan.borrowerId,
      memberName: loan.borrowerName,
      amount: iAmt,
      type: 'INTEREST_PAYMENT',
      category: 'Circle Interest Income',
      date: new Date().toISOString(),
      reference: `LOAN-REP-I-${Date.now().toString().slice(-4)}`,
      createdBy: users.find((u) => u.id === currentUserId)?.name || loan.borrowerName,
      notes: `Loan interest earned from ${loan.borrowerName} loan repayment`,
      auditInfo: 'Added to Circle Interest Revenue pool',
    });

    // Update member record
    const member = circleMembers.find((m) => m.circleId === loan.circleId && m.userId === loan.borrowerId);
    if (member) {
      member.outstandingLoan = loan.remainingAmount;
      if (loan.remainingAmount === 0) {
        member.loanRepaymentStatus = 'none';
      }
    }

    recordAudit(
      loan.circleId,
      'Loan Repayment Recorded',
      `Remaining: ₹${loan.remainingAmount + totalAmt}`,
      `Repaid ₹${totalAmt} (Principal: ₹${pAmt}, Interest: ₹${iAmt})`
    );

    sendNotification(
      loan.circleId,
      'Loan Repayment Received',
      `₹${totalAmt} received from ${loan.borrowerName} (Principal ₹${pAmt} + Interest ₹${iAmt}).`,
      'general',
      'loans'
    );

    res.json({ success: true, loan });
  });

  // ==================== GOALS ====================
  app.get('/api/circles/:id/goals', (req, res) => {
    const list = goals.filter((g) => g.circleId === req.params.id);
    res.json({ goals: list });
  });

  app.post('/api/circles/:id/goals', (req, res) => {
    const circleId = req.params.id;
    const { title, targetAmount, targetDate, category, description, icon } = req.body;

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      circleId,
      title: title || 'New Savings Goal',
      targetAmount: Number(targetAmount) || 20000,
      currentAmount: 0,
      targetDate: targetDate || '2027-01-01',
      category: category || 'Trip',
      description: description || 'Group savings milestone target.',
      icon: icon || 'Target',
    };

    goals.unshift(newGoal);
    recordAudit(circleId, 'Goal Created', 'None', `Created goal "${newGoal.title}" for ₹${newGoal.targetAmount}`);
    res.status(201).json({ success: true, goal: newGoal });
  });

  app.post('/api/circles/:id/goals/:goalId/contribute', (req, res) => {
    const { goalId } = req.params;
    const { amount } = req.body;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const add = Number(amount) || 1000;
    goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + add);

    recordAudit(goal.circleId, 'Goal Fund Allocated', `₹${goal.currentAmount - add}`, `₹${goal.currentAmount} to ${goal.title}`);
    res.json({ success: true, goal });
  });

  // ==================== VOTING ====================
  app.get('/api/circles/:id/votes', (req, res) => {
    const list = votes.filter((v) => v.circleId === req.params.id);
    res.json({ votes: list });
  });

  app.post('/api/circles/:id/votes', (req, res) => {
    const circleId = req.params.id;
    const { title, description, category, options, deadline, thresholdPercentage } = req.body;

    const opts = (options && options.length > 0 ? options : ['Approve', 'Reject']).map(
      (optText: string, idx: number) => ({
        id: `opt-${Date.now()}-${idx}`,
        text: typeof optText === 'string' ? optText : (optText as any).text,
        votesCount: 0,
        voterIds: [],
      })
    );

    const newVote: Vote = {
      id: `vote-${Date.now()}`,
      circleId,
      title: title || 'Group Decision Poll',
      description: description || '',
      category: category || 'Tour',
      options: opts,
      status: 'active',
      deadline: deadline || '2026-11-01',
      createdBy: users.find((u) => u.id === currentUserId)?.name || 'Admin',
      createdAt: new Date().toISOString(),
      thresholdPercentage: Number(thresholdPercentage) || 60,
    };

    votes.unshift(newVote);
    recordAudit(circleId, 'Poll Created', 'None', `Created poll: "${newVote.title}"`);
    sendNotification(circleId, 'New Group Vote Open', `Vote now: "${newVote.title}"`, 'vote_active', 'voting');

    res.status(201).json({ success: true, vote: newVote });
  });

  app.post('/api/circles/:id/votes/:voteId/cast', (req, res) => {
    const { voteId } = req.params;
    const { optionId } = req.body;

    const vote = votes.find((v) => v.id === voteId);
    if (!vote) return res.status(404).json({ error: 'Vote not found' });
    if (vote.status === 'closed') return res.status(400).json({ error: 'Poll is closed' });

    // Remove user's previous vote on this poll if any
    vote.options.forEach((opt) => {
      const idx = opt.voterIds.indexOf(currentUserId);
      if (idx !== -1) {
        opt.voterIds.splice(idx, 1);
        opt.votesCount = Math.max(0, opt.votesCount - 1);
      }
    });

    // Add vote to chosen option
    const chosen = vote.options.find((o) => o.id === optionId);
    if (chosen) {
      chosen.voterIds.push(currentUserId);
      chosen.votesCount += 1;
    }

    recordAudit(vote.circleId, 'Vote Cast', 'None', `Voted on "${vote.title}"`);
    res.json({ success: true, vote });
  });

  // ==================== TRANSACTIONS LEDGER ====================
  app.get('/api/circles/:id/transactions', (req, res) => {
    const list = transactions.filter((t) => t.circleId === req.params.id);
    res.json({ transactions: list });
  });

  app.post('/api/circles/:id/transactions/adjustment', (req, res) => {
    const circleId = req.params.id;
    const { amount, reason, type } = req.body;
    const adminUser = users.find((u) => u.id === currentUserId);

    const adjTx: Transaction = {
      id: `tx-adj-${Date.now()}`,
      circleId,
      amount: Number(amount) || 0,
      type: type || 'ADJUSTMENT',
      category: 'Accounting Adjustment',
      date: new Date().toISOString(),
      reference: `ADJ-${Date.now().toString().slice(-4)}`,
      createdBy: adminUser?.name || 'Admin',
      notes: reason || 'Manual audit correction with dual verification',
      auditInfo: `Created by ${adminUser?.name} (${adminUser?.role})`,
    };

    transactions.unshift(adjTx);
    recordAudit(circleId, 'Transaction Adjusted', 'None', `Adjusted ₹${adjTx.amount}: ${reason}`);
    res.status(201).json({ success: true, transaction: adjTx });
  });

  // ==================== REPORTS ENGINE ====================
  app.get('/api/circles/:id/reports', (req, res) => {
    const circleId = req.params.id;
    const circle = circles.find((c) => c.id === circleId);
    if (!circle) return res.status(404).json({ error: 'Circle not found' });

    const balance = calculateCircleBalance(circleId);
    const members = circleMembers.filter((m) => m.circleId === circleId);
    const circleContributions = contributions.filter((c) => c.circleId === circleId);
    const circleExpenses = expenses.filter((e) => e.circleId === circleId);
    const circleLoans = loans.filter((l) => l.circleId === circleId);
    const circleTours = tours.filter((t) => t.circleId === circleId);

    // 1. Contribution Report
    const contributionReport = members.map((m) => {
      const memberContr = circleContributions.filter((c) => c.userId === m.userId);
      const paidAmt = memberContr.filter((c) => c.status === 'Paid').reduce((sum, c) => sum + c.paidAmount, 0);
      const pendingAmt = memberContr.filter((c) => c.status === 'Pending').reduce((sum, c) => sum + c.amount, 0);
      const lateAmt = memberContr.filter((c) => c.status === 'Late').reduce((sum, c) => sum + c.amount, 0);
      return {
        memberId: m.userId,
        memberName: m.name,
        expectedAmount: memberContr.reduce((sum, c) => sum + c.amount, 0),
        paidAmount: paidAmt,
        pendingAmount: pendingAmt,
        lateAmount: lateAmt,
        status: pendingAmt === 0 ? 'Up-to-date' : 'Pending Payment',
      };
    });

    // 2. Expense Report by category
    const expenseByCategory: Record<string, { total: number; count: number; items: Expense[] }> = {};
    circleExpenses.forEach((e) => {
      if (!expenseByCategory[e.category]) {
        expenseByCategory[e.category] = { total: 0, count: 0, items: [] };
      }
      expenseByCategory[e.category].total += e.amount;
      expenseByCategory[e.category].count += 1;
      expenseByCategory[e.category].items.push(e);
    });

    // 3. Loan Report
    const loanReport = circleLoans.map((l) => ({
      loanId: l.id,
      borrower: l.borrowerName,
      principal: l.principal,
      interestTotal: l.totalInterest,
      totalRepayment: l.totalRepayment,
      paidAmount: l.totalPaid,
      outstanding: l.remainingAmount,
      status: l.status,
      dueDate: l.dueDate,
    }));

    // 4. Tour Report
    const tourReport = circleTours.map((t) => {
      const actualTotal = t.budgetBreakdown.reduce((sum, b) => sum + b.actualSpent, 0);
      return {
        tourId: t.id,
        title: t.title,
        budget: t.estimatedBudget,
        actualSpent: actualTotal,
        remaining: t.estimatedBudget - actualTotal,
        progressPct: Math.round((actualTotal / (t.estimatedBudget || 1)) * 100),
        perMemberCost: Math.round(t.estimatedBudget / (t.attendingMemberIds.length || 1)),
      };
    });

    // 5. Circle Financial Statement
    const financialStatement = {
      circleName: circle.name,
      currency: circle.currencySymbol,
      openingBalance: 0,
      totalContributions: balance.totalContributions,
      totalInterestIncome: balance.interestEarned,
      otherIncome: 0,
      totalExpenses: balance.totalExpenses,
      loanDisbursements: balance.loansGiven,
      loanRepayments: balance.loansPrincipalRepaid,
      netLoanOutstanding: balance.activeLoanOutstanding,
      closingBalance: balance.currentBalance,
      statementPeriod: 'October 2026 - Present',
    };

    res.json({
      contributionReport,
      expenseByCategory,
      loanReport,
      tourReport,
      financialStatement,
    });
  });

  // ==================== AUDIT LOGS ====================
  app.get('/api/circles/:id/audit-logs', (req, res) => {
    const list = auditLogs.filter((a) => a.circleId === req.params.id);
    res.json({ auditLogs: list });
  });

  // ==================== NOTIFICATIONS ====================
  app.get('/api/notifications', (req, res) => {
    res.json({ notifications });
  });

  app.patch('/api/notifications/:notifId/read', (req, res) => {
    const notif = notifications.find((n) => n.id === req.params.notifId);
    if (notif) notif.isRead = true;
    res.json({ success: true });
  });

  app.post('/api/notifications/mark-all-read', (req, res) => {
    notifications.forEach((n) => (n.isRead = true));
    res.json({ success: true });
  });

  // ==================== SUPER ADMIN ====================
  app.get('/api/superadmin/stats', (req, res) => {
    const totalTransactions = transactions.reduce((sum, t) => sum + t.amount, 0);
    const activeCircles = circles.length;
    const totalUsersCount = users.length;
    const activeLoansTotal = loans.filter((l) => l.status === 'Active').reduce((sum, l) => sum + l.remainingAmount, 0);

    const subscriptionCounts = {
      free: circles.filter((c) => c.planTier === 'free').length,
      pro: circles.filter((c) => c.planTier === 'pro').length,
      premium: circles.filter((c) => c.planTier === 'premium').length,
    };

    const monthlyRevenue = subscriptionCounts.pro * 99 + subscriptionCounts.premium * 199;

    res.json({
      totalUsers: totalUsersCount,
      totalCircles: activeCircles,
      totalVolumeTransacted: totalTransactions,
      activeLoansVolume: activeLoansTotal,
      monthlyRevenue,
      subscriptionCounts,
      circles,
      users,
    });
  });

  app.patch('/api/superadmin/users/:userId/status', (req, res) => {
    const user = users.find((u) => u.id === req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.status = req.body.status || 'active';
    res.json({ success: true, user });
  });

  app.patch('/api/superadmin/circles/:circleId/plan', (req, res) => {
    const circle = circles.find((c) => c.id === req.params.circleId);
    if (!circle) return res.status(404).json({ error: 'Circle not found' });
    circle.planTier = req.body.planTier || 'pro';
    res.json({ success: true, circle });
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Friends Circle Server running on http://localhost:${PORT}`);
  });
}

startServer();
