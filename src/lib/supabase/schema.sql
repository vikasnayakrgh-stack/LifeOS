-- Create a table to store user integrations/settings
create table if not exists user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  telegram_chat_id bigint unique,
  telegram_username text,
  telegram_verification_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_settings enable row level security;

-- Policies
create policy "Users can view their own settings"
  on user_settings for select
  using ( auth.uid() = user_id );

create policy "Users can update their own settings"
  on user_settings for update
  using ( auth.uid() = user_id );

create policy "Users can insert their own settings"
  on user_settings for insert
  with check ( auth.uid() = user_id );

-- Function to handle new user signup (optional, but good practice)
-- create or replace function public.handle_new_user()
-- returns trigger as $$
-- begin
--   insert into public.user_settings (user_id)
--   values (new.id);
--   return new;
-- end;
-- $$ language plpgsql security definer;

-- trigger is left out for now to avoid conflicts if user already exists
