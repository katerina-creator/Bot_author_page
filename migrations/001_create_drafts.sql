-- 001_create_drafts.sql
-- MVP: один активный draft на пользователя (partial unique index)
-- Draft хранится как единый JSONB в поле data

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1 активный draft на пользователя
CREATE UNIQUE INDEX IF NOT EXISTS uq_drafts_one_active_per_user
  ON drafts (user_id)
  WHERE is_active = true;

-- Быстро найти активный draft по user_id (под GET /drafts/me)
CREATE INDEX IF NOT EXISTS idx_drafts_active_user
  ON drafts (user_id)
  WHERE is_active = true;

-- Полезно для сортировки/очистки/архивации
CREATE INDEX IF NOT EXISTS idx_drafts_updated_at
  ON drafts (updated_at);

-- updated_at авто-обновление
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at ON drafts;

CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON drafts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

