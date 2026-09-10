-- =================================================================
-- BuddyFund Supabase SQL Schema
-- Target URL: https://tlrzxjhnypxyrjkbiigl.supabase.co
-- Run this in your Supabase Dashboard -> SQL Editor
-- =================================================================
-- MIGRATION HELPER (Run these lines if you already created tables earlier):
-- ALTER TABLE circles ADD COLUMN IF NOT EXISTS admin_name text default 'Circle Admin';
-- ALTER TABLE circles ADD COLUMN IF NOT EXISTS admin_photo_url text default '';
-- ALTER TABLE votes ADD COLUMN IF NOT EXISTS category text default 'Rule Change';
-- ALTER TABLE votes ADD COLUMN IF NOT EXISTS threshold_percentage numeric default 60;
-- ALTER TABLE votes ADD COLUMN IF NOT EXISTS result text default '';
-- =================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Circles Table
create table if not exists circles (
  id text primary key,
  name text not null,
  description text default '',
  photo_url text default '',
  currency text default 'INR',
  currency_symbol text default '₹',
  contribution_frequency text default 'weekly',
  contribution_amount numeric default 500,
  contribution_day text default 'Sunday',
  start_date date default current_date,
  expected_members integer default 10,
  admin_secret_code text default 'ADMIN2026',
  invite_code text default '',
  admin_name text default 'Circle Admin',
  admin_photo_url text default '',
  rules jsonb default '[]'::jsonb,
  created_by text default '',
  created_at timestamptz default now()
);

-- 3. Users Table
create table if not exists users (
  id text primary key,
  name text not null,
  email text default '',
  phone text default '',
  avatar_url text default '',
  role text default 'member',
  joined_date date default current_date,
  circle_ids jsonb default '[]'::jsonb,
  is_verified boolean default true,
  status text default 'active',
  password text default ''
);

-- 4. Circle Members Table
create table if not exists circle_members (
  id text primary key,
  user_id text not null,
  circle_id text not null references circles(id) on delete cascade,
  name text not null,
  email text default '',
  phone text default '',
  avatar_url text default '',
  role text default 'member',
  joined_date date default current_date,
  total_contributed numeric default 0,
  total_received numeric default 0,
  pending_contribution numeric default 0,
  outstanding_loan numeric default 0,
  loan_repayment_status text default 'none',
  password text default ''
);

-- 5. Contributions Table
create table if not exists contributions (
  id text primary key,
  circle_id text not null references circles(id) on delete cascade,
  user_id text not null,
  user_name text default '',
  week_number integer not null,
  week_label text default '',
  due_date date,
  amount numeric not null default 0,
  paid_amount numeric default 0,
  status text default 'Pending',
  paid_date timestamptz,
  payment_method text default 'Cash',
  reference_note text default '',
  recorded_by text default ''
);

-- 6. Transactions Table (Double-Entry Ledger)
create table if not exists transactions (
  id text primary key,
  circle_id text not null references circles(id) on delete cascade,
  member_id text default '',
  member_name text default '',
  amount numeric not null,
  type text not null,
  category text default '',
  date timestamptz default now(),
  reference text default '',
  created_by text default '',
  notes text default '',
  receipt_url text default '',
  audit_info text default ''
);

-- 7. Expenses Table
create table if not exists expenses (
  id text primary key,
  circle_id text not null references circles(id) on delete cascade,
  title text not null,
  amount numeric not null,
  date date default current_date,
  category text default 'Other',
  paid_by text default '',
  description text default '',
  receipt_url text default '',
  participants jsonb default '["all"]'::jsonb,
  tour_id text,
  created_at timestamptz default now()
);

-- 8. Loans Table
create table if not exists loans (
  id text primary key,
  circle_id text not null references circles(id) on delete cascade,
  borrower_id text not null,
  borrower_name text default '',
  borrower_avatar text default '',
  principal numeric not null,
  interest_rate numeric default 2,
  interest_type text default 'Monthly',
  duration_months integer default 3,
  start_date date default current_date,
  due_date date,
  total_repayment numeric not null default 0,
  remaining_amount numeric not null default 0,
  monthly_emi numeric not null default 0,
  purpose text default '',
  status text default 'Active',
  repayments jsonb default '[]'::jsonb
);

-- 9. Goals Table
create table if not exists goals (
  id text primary key,
  circle_id text not null references circles(id) on delete cascade,
  title text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  deadline date,
  category text default 'General',
  created_at timestamptz default now()
);

-- 10. Decision Votes / Polls Table
create table if not exists votes (
  id text primary key,
  circle_id text not null references circles(id) on delete cascade,
  title text not null,
  description text default '',
  options jsonb default '[]'::jsonb,
  created_by text default '',
  created_at timestamptz default now(),
  expires_at timestamptz,
  status text default 'Active'
);

-- 11. Security Audit Logs Table
create table if not exists audit_logs (
  id text primary key,
  circle_id text not null references circles(id) on delete cascade,
  user_id text default '',
  user_name text default '',
  action text not null,
  timestamp timestamptz default now(),
  old_value text,
  new_value text,
  ip_info text default ''
);

-- 12. Tours & Group Vacation Planning Table
create table if not exists tours (
  id text primary key,
  circle_id text not null references circles(id) on delete cascade,
  title text not null,
  destination text not null,
  duration text default '3 Days / 2 Nights',
  start_date date,
  end_date date,
  estimated_budget numeric not null default 0,
  allocated_from_circle numeric default 0,
  status text default 'planning',
  banner_url text default '',
  budget_breakdown jsonb default '[]'::jsonb,
  attending_member_ids jsonb default '[]'::jsonb,
  itinerary jsonb default '[]'::jsonb,
  documents jsonb default '[]'::jsonb,
  notes text default '',
  created_at timestamptz default now()
);

-- =================================================================
-- Row Level Security (RLS) & Public Access Policies
-- Enable read & write access for authenticated or anon key clients
-- =================================================================
alter table circles enable row level security;
alter table users enable row level security;
alter table circle_members enable row level security;
alter table contributions enable row level security;
alter table transactions enable row level security;
alter table expenses enable row level security;
alter table loans enable row level security;
alter table goals enable row level security;
alter table votes enable row level security;
alter table audit_logs enable row level security;
alter table tours enable row level security;

create policy "Allow all operations for circles" on circles for all using (true) with check (true);
create policy "Allow all operations for users" on users for all using (true) with check (true);
create policy "Allow all operations for circle_members" on circle_members for all using (true) with check (true);
create policy "Allow all operations for contributions" on contributions for all using (true) with check (true);
create policy "Allow all operations for transactions" on transactions for all using (true) with check (true);
create policy "Allow all operations for expenses" on expenses for all using (true) with check (true);
create policy "Allow all operations for loans" on loans for all using (true) with check (true);
create policy "Allow all operations for goals" on goals for all using (true) with check (true);
create policy "Allow all operations for votes" on votes for all using (true) with check (true);
create policy "Allow all operations for audit_logs" on audit_logs for all using (true) with check (true);
create policy "Allow all operations for tours" on tours for all using (true) with check (true);
