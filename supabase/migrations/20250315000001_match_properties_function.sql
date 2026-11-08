-- Rank public.properties by cosine distance against a query embedding.
-- Follows supabase/migrations/20250315000000_enable_pgvector_properties.sql
-- and docs/pgvector-setup-plan.md:
--   table public.properties
--   column embedding vector(1536)
--   metric: pgvector cosine distance operator <=> (smaller distance = closer)
--
-- Rows are ordered by <=> ascending so the best match is first.
-- The returned score is cosine similarity (1 - distance): a larger similarity
-- is a better match. Null embeddings are excluded.
-- There is no location column; city and state are the place fields.
--
-- SECURITY INVOKER: the caller runs the query with their own privileges, so
-- they also need SELECT on public.properties. search_path is locked so the
-- body cannot pick up a different vector operator from an untrusted schema.
-- extensions is included because Supabase installs pgvector there.

create or replace function public.match_properties(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (
  id uuid,
  title text,
  description text,
  city text,
  state text,
  price numeric,
  created_at timestamptz,
  similarity float
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    p.id,
    p.title,
    p.description,
    p.city,
    p.state,
    p.price,
    p.created_at,
    (1 - (p.embedding <=> query_embedding))::float as similarity
  from public.properties p
  where p.embedding is not null
  order by p.embedding <=> query_embedding
  limit greatest(coalesce(match_count, 5), 1);
$$;

revoke all on function public.match_properties(vector(1536), int) from public;
revoke all on function public.match_properties(vector(1536), int) from anon;

grant execute on function public.match_properties(vector(1536), int) to authenticated;
grant execute on function public.match_properties(vector(1536), int) to service_role;
