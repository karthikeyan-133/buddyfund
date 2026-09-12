export type Role = 'super_admin' | 'circle_admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: Role;
  joinedDate: string;
  circleIds: string[];
  isVerified: boolean;
  status: 'active' | 'suspended';
  password?: string;
}

export type ContributionFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface Circle {
  id: string;
  name: string;
  description: string;
  photoUrl: string;
  currency: string;
  currencySymbol: string;
  contributionFrequency: ContributionFrequency;
  contributionAmount: number;
  contributionDay: string; // e.g. 'Sunday'
  startDate: string;
  expectedMembers: number;
  rules: string[];
  createdBy: string;
  createdAt: string;
  planTier: 'free' | 'pro' | 'premium';
  inviteCode?: string;
  adminSecretCode?: string;
  adminName?: string;
  adminPhotoUrl?: string;
  adminUpiId?: string;
  adminPhone?: string;
}

export interface CircleMember {
  id: string;
  userId: string;
  circleId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: 'circle_admin' | 'member';
  joinedDate: string;
  totalContributed: number;
  totalReceived: number;
  pendingContribution: number;
  outstandingLoan: number;
  loanRepaymentStatus: 'none' | 'good' | 'overdue';
  password?: string;
}

export type ContributionStatus = 'Paid' | 'Pending' | 'Pending Confirmation' | 'Late' | 'Partially Paid' | 'Waived';

export interface ContributionRecord {
  id: string;
  circleId: string;
  userId: string;
  userName: string;
  weekNumber: number;
  weekLabel: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: ContributionStatus;
  paidDate?: string;
  paymentMethod?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';
  referenceNote?: string;
  receiptUrl?: string;
  recordedBy?: string;
  submittedAt?: string;
  adminDecisionDate?: string;
  rejectionReason?: string;
}

export type TransactionType =
  | 'CONTRIBUTION'
  | 'EXPENSE'
  | 'LOAN_DISBURSEMENT'
  | 'LOAN_PRINCIPAL_REPAYMENT'
  | 'INTEREST_PAYMENT'
  | 'REFUND'
  | 'ADJUSTMENT'
  | 'OTHER_INCOME';

export interface Transaction {
  id: string;
  circleId: string;
  memberId?: string;
  memberName?: string;
  amount: number;
  type: TransactionType;
  category?: string;
  date: string;
  reference: string;
  createdBy: string;
  notes: string;
  receiptUrl?: string;
  auditInfo: string;
}

export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Hotel'
  | 'Fuel'
  | 'Tickets'
  | 'Shopping'
  | 'Events'
  | 'Emergency'
  | 'Other';

export interface Expense {
  id: string;
  circleId: string;
  title: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  paidBy: string; // Member name or 'Circle Fund'
  paidByMemberId?: string;
  description: string;
  receiptUrl?: string;
  participants: string[]; // member IDs or 'All Members'
  tourId?: string;
  tourName?: string;
  notes?: string;
  createdAt: string;
}

export interface TourBudgetItem {
  category: string;
  allocated: number;
  actualSpent: number;
}

export interface Tour {
  id: string;
  circleId: string;
  title: string;
  destination: string;
  duration: string; // e.g., '4 Days / 3 Nights'
  startDate: string;
  endDate: string;
  estimatedBudget: number;
  allocatedFromCircle: number;
  status: 'planning' | 'confirmed' | 'ongoing' | 'completed';
  budgetBreakdown: TourBudgetItem[];
  attendingMemberIds: string[];
  bannerUrl: string;
  itinerary: { day: number; title: string; description: string }[];
  documents: { title: string; url: string; type: string }[];
  notes: string;
}

export type LoanStatus = 'Pending' | 'Approved' | 'Active' | 'Repaid' | 'Rejected';
export type LoanRepaymentMethod = 'ten_day_cycle' | 'weekly_emi';

export interface LoanInstallment {
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalDue: number;
  paidAmount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  paidDate?: string;
}

export interface LoanApprovalVote {
  userId: string;
  userName: string;
  userRole: Role;
  decision: 'approve' | 'reject';
  votedAt: string;
}

export interface Loan {
  id: string;
  circleId: string;
  borrowerId: string;
  borrowerName: string;
  borrowerAvatar: string;
  principal: number;
  interestRate: number; // e.g., 5 (% per month / per cycle)
  interestType: 'Monthly' | 'Flat';
  durationMonths: number;
  startDate: string;
  dueDate: string;
  monthlyInterest: number;
  totalInterest: number;
  totalRepayment: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  remainingAmount: number;
  status: LoanStatus;
  purpose: string;
  reviewedBy?: string;
  reviewedDate?: string;
  installments: LoanInstallment[];
  repaymentMethod?: LoanRepaymentMethod;
  cycleDays?: number; // e.g., 10 days
  tenureWeeks?: number; // e.g., 4, 8, 12 weeks
  weeklyEmiAmount?: number; // for weekly EMI
  approvals?: LoanApprovalVote[];
}

export interface Goal {
  id: string;
  circleId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'Trip' | 'Party' | 'Tournament' | 'Emergency Fund' | 'Equipment' | 'Other';
  description: string;
  icon: string;
}

export interface VoterDetail {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  votedAt?: string;
}

export interface VoteOption {
  id: string;
  text: string;
  votesCount: number;
  voterIds: string[];
  voters?: VoterDetail[];
}

export interface Vote {
  id: string;
  circleId: string;
  title: string;
  description: string;
  category: 'Tour' | 'Large Expense' | 'Loan Request' | 'Contribution Change' | 'Rule Change' | 'Other';
  options: VoteOption[];
  status: 'active' | 'closed';
  deadline: string;
  createdBy: string;
  createdAt: string;
  thresholdPercentage: number;
  result?: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  circleId?: string;
  targetRole?: 'circle_admin' | 'member' | 'all';
  title: string;
  message: string;
  type: 'contribution_due' | 'payment_received' | 'loan_due' | 'tour_update' | 'vote_active' | 'general';
  date: string;
  isRead: boolean;
  linkToTab?: string;
}

export interface AuditLog {
  id: string;
  circleId: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
  ipInfo?: string;
}

export interface CircleWalletSummary {
  currentBalance: number;
  totalContributions: number;
  totalExpenses: number;
  tourExpenses: number;
  foodExpenses: number;
  loansGiven: number;
  interestEarned: number;
  activeLoanOutstanding: number;
  totalSavingsTarget: number;
  weeklyCollectionExpected: number;
  weeklyCollectionActual: number;
}
