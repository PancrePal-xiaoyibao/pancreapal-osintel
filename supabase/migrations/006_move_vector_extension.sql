-- Move vector extension out of public schema for Supabase security advisor.

alter extension vector set schema extensions;

alter table public.intelligence_events
  alter column embedding type extensions.vector(1536)
  using embedding::extensions.vector(1536);

