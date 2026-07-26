-- Esquema real vigente en Supabase (documentado aquí para referencia; ya está
-- creado en el proyecto, no hace falta volver a correrlo). Reemplaza al primer
-- intento (presupuesto/deudas/metas/gastos, ver abajo) con un modelo normalizado
-- que sí soporta presupuesto real por mes (budgets.month/year).

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  currency text not null default 'CLP',
  timezone text default 'America/Santiago',
  created_at timestamptz not null default now()
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('checking', 'savings', 'cash', 'credit_card', 'investment')),
  currency text not null default 'CLP',
  initial_balance numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text,
  color text,
  created_at timestamptz default now()
);

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  amount numeric not null,
  month smallint not null check (month >= 1 and month <= 12),
  year smallint not null,
  created_at timestamptz default now()
);

create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution text not null,
  name text not null,
  balance numeric not null,
  interest_rate numeric default 0,
  minimum_payment numeric default 0,
  current_payment numeric default 0,
  due_day smallint,
  status text default 'current' check (status in ('current', 'late', 'paid')),
  created_at timestamptz default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null,
  saved_amount numeric default 0,
  target_date date,
  status text default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric not null,
  description text,
  transaction_date date not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table accounts enable row level security;
alter table categories enable row level security;
alter table budgets enable row level security;
alter table debts enable row level security;
alter table goals enable row level security;
alter table transactions enable row level security;

create policy profiles_all on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy accounts_all on accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy categories_all on categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy budgets_all on budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy debts_all on debts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy goals_all on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy transactions_all on transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Tablas legacy (presupuesto, deudas, metas, gastos): primer intento de este
-- esquema, ya NO las usa la app tras la migración a las tablas de arriba.
-- Se dejan sin tocar por si hace falta revisar/recuperar algo; bórralas cuando
-- confirmes que todo funciona bien con el esquema nuevo:
--
-- drop table if exists presupuesto cascade;
-- drop table if exists deudas cascade;
-- drop table if exists metas cascade;
-- drop table if exists gastos cascade;
