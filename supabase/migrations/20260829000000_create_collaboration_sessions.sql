create table if not exists public.collaboration_sessions (
  session_id uuid primary key,
  tool_type text not null,
  title text not null default '',
  state jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists collaboration_sessions_tool_type_idx
  on public.collaboration_sessions (tool_type);

create index if not exists collaboration_sessions_updated_at_idx
  on public.collaboration_sessions (updated_at desc);

alter table public.collaboration_sessions enable row level security;

-- The application API uses the server-only service role key. No public
-- browser policy is granted because session URLs are the access boundary.
