-- ============================================================
-- SwasthyaSathi · Supabase Schema (Full)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PATIENTS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT        NOT NULL,
  age           INTEGER     NOT NULL CHECK (age > 0 AND age < 150),
  gender        TEXT        NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  symptoms      TEXT,
  diagnosis     TEXT,
  village       TEXT        NOT NULL,
  weight        NUMERIC(5,1),
  temp          NUMERIC(4,1),
  bp            TEXT,
  spo2          INTEGER     CHECK (spo2 IS NULL OR (spo2 >= 0 AND spo2 <= 100)),
  duration      TEXT,
  duration_unit TEXT        DEFAULT 'days' CHECK (duration_unit IS NULL OR duration_unit IN ('hours','days','weeks')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── MIGRATION: add vitals columns to existing table ─────────
-- (safe to re-run — uses IF NOT EXISTS)
DO $$ BEGIN
  ALTER TABLE patients ADD COLUMN IF NOT EXISTS weight        NUMERIC(5,1);
  ALTER TABLE patients ADD COLUMN IF NOT EXISTS temp          NUMERIC(4,1);
  ALTER TABLE patients ADD COLUMN IF NOT EXISTS bp            TEXT;
  ALTER TABLE patients ADD COLUMN IF NOT EXISTS spo2          INTEGER;
  ALTER TABLE patients ADD COLUMN IF NOT EXISTS duration      TEXT;
  ALTER TABLE patients ADD COLUMN IF NOT EXISTS duration_unit TEXT DEFAULT 'days';
END $$;

-- ── ASHA WORKERS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS asha_workers (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_name TEXT        NOT NULL,
  worker_id   TEXT        UNIQUE,
  phc_block   TEXT,
  district    TEXT,
  state       TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── AUTO UPDATE updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_patients_updated_at ON patients;
CREATE TRIGGER set_patients_updated_at
BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_asha_updated_at ON asha_workers;
CREATE TRIGGER set_asha_updated_at
BEFORE UPDATE ON asha_workers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE patients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE asha_workers ENABLE ROW LEVEL SECURITY;

-- Patients
DROP POLICY IF EXISTS "Allow public read on patients"   ON patients;
DROP POLICY IF EXISTS "Allow public insert on patients" ON patients;
DROP POLICY IF EXISTS "Allow public update on patients" ON patients;
DROP POLICY IF EXISTS "Allow public delete on patients" ON patients;
CREATE POLICY "Allow public read on patients"    ON patients FOR SELECT USING (true);
CREATE POLICY "Allow public insert on patients"  ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on patients"  ON patients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on patients"  ON patients FOR DELETE USING (true);

-- ASHA Workers
DROP POLICY IF EXISTS "Allow public read on asha"    ON asha_workers;
DROP POLICY IF EXISTS "Allow public insert on asha"  ON asha_workers;
DROP POLICY IF EXISTS "Allow public update on asha"  ON asha_workers;
CREATE POLICY "Allow public read on asha"    ON asha_workers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on asha"  ON asha_workers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on asha"  ON asha_workers FOR UPDATE USING (true);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patients_village ON patients (village);
CREATE INDEX IF NOT EXISTS idx_patients_created ON patients (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_asha_worker_id   ON asha_workers (worker_id);
