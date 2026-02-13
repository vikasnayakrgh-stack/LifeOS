-- Add subtasks column to tasks table (JSONB array of {id, title, isCompleted})
alter table tasks 
add column if not exists subtasks jsonb default '[]'::jsonb;
