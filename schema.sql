-- IdeaHolder schema
-- Paste into Supabase SQL editor and run once.

create extension if not exists pgcrypto;

create table if not exists ideas (
  id          uuid        primary key default gen_random_uuid(),
  number      bigint      generated always as identity,
  content     text        not null check (length(content) > 0),
  created_at  timestamptz not null default now()
);

create index if not exists ideas_created_at_idx on ideas (created_at desc);
create index if not exists ideas_number_idx     on ideas (number desc);
