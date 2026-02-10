-- Enable UUID extension
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student',
  created_at timestamptz not null default now()
);

create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  grade int not null check (grade >= 0 and grade <= 12),
  created_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade_band text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  prompt text not null,
  choices jsonb not null,
  correct_choice text not null,
  difficulty int not null check (difficulty between 1 and 5),
  explanation text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  attempt_type text not null check (attempt_type in ('diagnostic', 'practice')),
  is_correct boolean not null,
  selected_choice text not null,
  time_spent_sec int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.mastery (
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  mastery_score numeric not null check (mastery_score >= 0 and mastery_score <= 1),
  updated_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);

alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.skills enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
alter table public.mastery enable row level security;

-- Profiles policies
create policy "Users can read own profile" on public.profiles
for select using (auth.uid() = user_id);

create policy "Users can insert own profile" on public.profiles
for insert with check (auth.uid() = user_id);

-- Student profiles policies
create policy "Users can read own student profile" on public.student_profiles
for select using (auth.uid() = user_id);

create policy "Users can insert own student profile" on public.student_profiles
for insert with check (auth.uid() = user_id);

create policy "Users can update own student profile" on public.student_profiles
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Skills and questions readable by all authenticated users
create policy "Authenticated can read skills" on public.skills
for select using (auth.role() = 'authenticated');

create policy "Authenticated can read questions" on public.questions
for select using (auth.role() = 'authenticated');

-- Attempts policies
create policy "Users can read own attempts" on public.attempts
for select using (auth.uid() = user_id);

create policy "Users can insert own attempts" on public.attempts
for insert with check (auth.uid() = user_id);

-- Mastery policies
create policy "Users can read own mastery" on public.mastery
for select using (auth.uid() = user_id);

create policy "Users can upsert own mastery" on public.mastery
for insert with check (auth.uid() = user_id);

create policy "Users can update own mastery" on public.mastery
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Automatically create profile for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
