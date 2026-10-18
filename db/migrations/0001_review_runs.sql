-- The worked example of a migration, and a table you will probably want: one
-- row per run of the review job, so the queue can say when it last ran and
-- under which revision of the requirements doc.
--
-- Add your own as new files: 0002_reviews.sql, 0003_decisions.sql. Applied
-- files are never re-run, so change a table with a new migration.

create table review_runs (
  id bigserial primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  rule_revision text not null,
  listing_count integer
);
