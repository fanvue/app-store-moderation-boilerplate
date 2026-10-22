-- The worked example of a migration: one row per run of the review job.
--
-- Migrations run in file name order. Applied files are never re-run, so a
-- change to a table needs a new file.

create table review_runs (
  id bigserial primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  rule_revision text not null,
  listing_count integer
);
