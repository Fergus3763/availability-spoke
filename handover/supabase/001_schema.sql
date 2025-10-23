-- 001_schema.sql — WorXInn Meeting Room SaaS (Stage 1) — Supabase/Postgres
-- Safe to re-run.

create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  if not exists (select 1 from pg_type where typname = 'heading_enum') then
    create type heading_enum as enum ('F&B','AV','Labour','3rd Party','Add-On');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'visibility_enum') then
    create type visibility_enum as enum ('included','optional','hidden');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'basis_enum') then
    create type basis_enum as enum ('Per Booking','Per Person','Per Hour','Half-Day','Day');
  end if;
end $$;

-- Tables
create table if not exists vat (
  id               text primary key,
  name             text not null unique,
  rate_percent     numeric,
  applies_to_json  jsonb
);

create table if not exists catalog (
  id                 text primary key,
  name               text,
  heading            heading_enum,
  vat_category       text references vat(name) on update cascade on delete restrict,
  rate_per_hour      numeric,
  rate_half_day      numeric,
  rate_day           numeric,
  rate_per_person    numeric,
  rate_per_booking   numeric,
  included_default   boolean,
  included_condition text,
  notes              text
);

create table if not exists rooms (
  id                   text primary key,
  venue_id             text,
  name                 text,
  code                 text not null unique,
  description          text,
  size_sqm             numeric,
  height_m             numeric,
  accessible           boolean,
  features_json        jsonb,
  images_json          jsonb,
  layouts_json         jsonb,
  base_rate_hour       numeric,
  base_rate_half_day   numeric,
  base_rate_day        numeric
);

create table if not exists durations (
  code   text primary key,
  label  text,
  hours  numeric
);

create table if not exists room_catalog_map (
  id                   text primary key,
  room_id              text not null references rooms(id) on update cascade on delete cascade,
  catalog_item_id      text not null references catalog(id) on update cascade on delete cascade,
  visibility           visibility_enum,
  basis_override       basis_enum,
  rate_overrides_json  jsonb,
  min_qty              numeric,
  max_qty              numeric,
  default_qty          numeric,
  auto_suggest         boolean
);

-- Optional availability table for later spokes
create table if not exists blackout_periods (
  id         uuid primary key default gen_random_uuid(),
  room_id    text not null references rooms(id) on update cascade on delete cascade,
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  reason     text
);

-- Indexes
create index if not exists idx_catalog_vat_category on catalog (vat_category);
create index if not exists idx_rcm_room_id on room_catalog_map (room_id);
create index if not exists idx_rcm_catalog_item_id on room_catalog_map (catalog_item_id);
create index if not exists idx_blackout_room_time on blackout_periods (room_id, starts_at, ends_at);

