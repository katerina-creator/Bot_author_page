-- 003_create_draft_versions.sql
-- KAN-9: Version snapshots on publish

CREATE TABLE IF NOT EXISTS draft_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES drafts(id),
  user_id BIGINT NOT NULL,
  version_number INT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraint: Unique version number per draft
  UNIQUE (draft_id, version_number)
);

-- Index for fast lookup of versions by draft
CREATE INDEX IF NOT EXISTS idx_draft_versions_draft_id
  ON draft_versions (draft_id);

-- Index for optional lookup by user
CREATE INDEX IF NOT EXISTS idx_draft_versions_user_id
  ON draft_versions (user_id);
