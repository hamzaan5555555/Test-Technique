-- =====================================================================
-- EventHub - Schéma PostgreSQL (>= 13)
-- ATTENTION : ce script SUPPRIME puis recrée les tables (usage dev/test).
-- =====================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- crypt() / gen_salt() pour le seed
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- recherche ILIKE performante

-- Reset
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS participants  CASCADE;
DROP TABLE IF EXISTS events        CASCADE;
DROP TABLE IF EXISTS users         CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- ---------------------------------------------------------------------
-- Trigger générique : met à jour updated_at
-- ---------------------------------------------------------------------
CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- users : comptes de l'application (admin / staff)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  role          VARCHAR(10)  NOT NULL DEFAULT 'staff',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_role_check   CHECK (role IN ('admin', 'staff')),
  CONSTRAINT users_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------
CREATE TABLE events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  location         VARCHAR(255) NOT NULL,
  event_date       TIMESTAMPTZ  NOT NULL,
  max_participants INTEGER      NOT NULL,
  status           VARCHAR(10)  NOT NULL DEFAULT 'draft',
  created_by       UUID         NOT NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT events_created_by_fk
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT events_title_not_blank CHECK (length(btrim(title)) > 0),
  CONSTRAINT events_max_positive    CHECK (max_participants > 0),
  CONSTRAINT events_status_check    CHECK (status IN ('draft', 'published', 'cancelled'))
);

CREATE INDEX idx_events_status     ON events (status);
CREATE INDEX idx_events_event_date ON events (event_date);
CREATE INDEX idx_events_created_by ON events (created_by);
CREATE INDEX idx_events_title_trgm ON events USING gin (title gin_trgm_ops);

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- participants
-- ---------------------------------------------------------------------
CREATE TABLE participants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  VARCHAR(150) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  phone      VARCHAR(30),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT participants_email_unique UNIQUE (email),
  CONSTRAINT participants_name_not_blank CHECK (length(btrim(full_name)) > 0),
  CONSTRAINT participants_email_format
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Recherche par nom ou email (ILIKE '%...%')
CREATE INDEX idx_participants_full_name_trgm ON participants USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_participants_email_trgm     ON participants USING gin (email gin_trgm_ops);

CREATE TRIGGER trg_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- registrations : relation N-N events <-> participants
-- ---------------------------------------------------------------------
CREATE TABLE registrations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID        NOT NULL,
  participant_id UUID        NOT NULL,
  status         VARCHAR(10) NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT registrations_event_fk
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT registrations_participant_fk
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  CONSTRAINT registrations_status_check
    CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  -- Règle métier : pas d'inscription en double au même événement
  CONSTRAINT registrations_event_participant_unique
    UNIQUE (event_id, participant_id)
);

-- (event_id, status) : comptage des places prises + filtre GET /registrations
CREATE INDEX idx_registrations_event_status ON registrations (event_id, status);
CREATE INDEX idx_registrations_participant  ON registrations (participant_id);
-- Dashboard : inscriptions du jour
CREATE INDEX idx_registrations_created_at   ON registrations (created_at);

CREATE TRIGGER trg_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();