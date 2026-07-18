-- ============================================================
-- Migration 001: Initial schema for WC2026 Lottery App
-- Slots: numbers 3-28 excluding 12 (GK) = 25 outfield slots
-- ============================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---- Admin accounts ----------------------------------------
CREATE TYPE admin_role AS ENUM ('admin', 'super_admin');

CREATE TABLE admins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    role            admin_role NOT NULL DEFAULT 'admin',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES admins(id) ON DELETE SET NULL
);

-- ---- Player/ticket slots -----------------------------------
CREATE TYPE slot_status AS ENUM ('available', 'assigned');

CREATE TABLE players (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_number       INT UNIQUE NOT NULL,
    status              slot_status NOT NULL DEFAULT 'available',
    otp_hash            TEXT,
    customer_name       TEXT,
    customer_phone      TEXT,
    assigned_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    assigned_at         TIMESTAMPTZ,
    voided_at           TIMESTAMPTZ,
    voided_by           UUID REFERENCES admins(id) ON DELETE SET NULL,

    CONSTRAINT valid_player_number CHECK (
        player_number BETWEEN 3 AND 28 AND player_number != 12
    )
);

-- ---- Rate-limit tracking for public /reveal endpoint ------
CREATE TABLE reveal_attempts (
    id          BIGSERIAL PRIMARY KEY,
    ip_address  TEXT NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    success     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_reveal_attempts_ip_time
    ON reveal_attempts (ip_address, attempted_at DESC);

-- ---- Audit log ---------------------------------------------
CREATE TABLE audit_log (
    id          BIGSERIAL PRIMARY KEY,
    admin_id    UUID REFERENCES admins(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    target_id   UUID,
    meta        JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- Seed the 25 outfield slot rows (3-28 excl. 12) -------
INSERT INTO players (player_number, status)
SELECT n, 'available'
FROM generate_series(3, 28) AS n
WHERE n != 12;

-- ---- Row Level Security (disable direct client access) ----
-- All writes go through Netlify Functions using the service-role key,
-- so RLS policies just deny public anon access entirely.

ALTER TABLE players       ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reveal_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log     ENABLE ROW LEVEL SECURITY;

-- No SELECT/INSERT/UPDATE/DELETE for anon or authenticated roles.
-- The service-role key used by Netlify Functions bypasses RLS.
-- (No policies needed — absence of policy = deny all for non-service-role)
