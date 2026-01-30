-- 001_create_drafts.sql
-- MVP: один активный draft на пользователя (UNIQUE user_id)
-- Draft хранится как единый JSONB в поле data

CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL UNIQUE,
  lang VARCHAR(8) NOT NULL DEFAULT 'en',
  status VARCHAR(16) NOT NULL DEFAULT 'draft',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drafts_updated_at ON drafts(updated_at);
