-- IdeaHolder schema
-- Paste into Supabase SQL editor and run once.

create extension if not exists pgcrypto;

create table if not exists ideas (
  id          uuid        primary key default gen_random_uuid(),
  number      bigint      generated always as identity,
  content     text        not null check (length(content) > 0),
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index if not exists ideas_created_at_idx on ideas (created_at desc);
create index if not exists ideas_number_idx     on ideas (number desc);
create index if not exists ideas_deleted_at_idx on ideas (deleted_at);

-- Migration for existing projects (idempotent):
alter table ideas add column if not exists deleted_at timestamptz;
create index if not exists ideas_deleted_at_idx on ideas (deleted_at);

create table if not exists reminders (
  id                  uuid        primary key default gen_random_uuid(),
  number              bigint      generated always as identity,
  content             text        not null check (length(content) > 0),
  deadline            timestamptz,
  created_at          timestamptz not null default now(),
  completed_at        timestamptz,
  deleted_at          timestamptz,
  notified_day_before boolean     not null default false
);

create index if not exists reminders_deadline_idx     on reminders (deadline);
create index if not exists reminders_created_at_idx   on reminders (created_at desc);
create index if not exists reminders_completed_at_idx on reminders (completed_at);
create index if not exists reminders_deleted_at_idx   on reminders (deleted_at);

create table if not exists push_subscriptions (
  id          uuid        primary key default gen_random_uuid(),
  endpoint    text        not null unique,
  p256dh      text        not null,
  auth        text        not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);
