-- Create daily_logs table
create table public.daily_logs (
  date date primary key not null default current_date,
  user_id uuid references auth.users not null default auth.uid(),
  sleep_hours numeric,
  steps integer,
  mood integer check (mood >= 1 and mood <= 10),
  focus_minutes integer default 0,
  tasks_completed integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.daily_logs enable row level security;

create policy "Users can view their own logs"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own logs"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own logs"
  on public.daily_logs for update
  using (auth.uid() = user_id);
