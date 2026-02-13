-- Add resistance tracking columns
alter table tasks 
add column if not exists created_at timestamptz default now(),
add column if not exists reschedule_count int default 0;
