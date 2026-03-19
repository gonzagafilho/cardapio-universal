-- Enforce at most one OPEN session per table.
-- 1) Normalize legacy duplicates by closing older OPEN sessions per table.
-- 2) Add partial unique index to prevent concurrent duplicates.

WITH ranked_open_sessions AS (
  SELECT
    id,
    "tableId",
    ROW_NUMBER() OVER (
      PARTITION BY "tableId"
      ORDER BY "openedAt" DESC, "createdAt" DESC, id DESC
    ) AS rn
  FROM "TableSession"
  WHERE status = 'OPEN'
),
to_close AS (
  SELECT id
  FROM ranked_open_sessions
  WHERE rn > 1
)
UPDATE "TableSession"
SET
  status = 'CLOSED',
  "closedAt" = COALESCE("closedAt", NOW()),
  "updatedAt" = NOW()
WHERE id IN (SELECT id FROM to_close);

CREATE UNIQUE INDEX "TableSession_one_open_session_per_table_idx"
ON "TableSession" ("tableId")
WHERE status = 'OPEN';
