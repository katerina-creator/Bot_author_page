-- 002_add_token_to_drafts.sql
-- KAN-16: Add public access preview_token to drafts

ALTER TABLE drafts 
ADD COLUMN IF NOT EXISTS preview_token TEXT;

-- Index for fast lookup by token.
-- KAN-16: Token must be globally unique (1:1 with draft), not just for active ones.
-- We only exclude NULLs.
CREATE UNIQUE INDEX IF NOT EXISTS idx_drafts_preview_token
  ON drafts (preview_token)
  WHERE preview_token IS NOT NULL;
