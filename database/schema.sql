CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY, email text NOT NULL UNIQUE,
  name text NOT NULL, password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash text PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON admin_sessions(expires_at);
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY, slug text NOT NULL UNIQUE,
  publication text NOT NULL DEFAULT 'draft' CHECK (publication IN ('draft', 'published', 'archived')),
  data jsonb NOT NULL, version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS properties_publication ON properties(publication);
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY, slug text NOT NULL UNIQUE,
  publication text NOT NULL DEFAULT 'draft' CHECK (publication IN ('draft', 'published', 'archived')),
  data jsonb NOT NULL, version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS articles_publication ON articles(publication);
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='realty_app') THEN
    GRANT SELECT,INSERT,UPDATE,DELETE ON articles TO realty_app;
  END IF;
END $$;
-- Compatible with the exported Supabase leads table. Existing leads stay intact.
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('contact','valuation','property_inquiry')),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  phone text, message text, property_slug text, property_type text,
  property_location text, property_size text,
  consent boolean NOT NULL CHECK (consent = true),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS leads_created ON leads(created_at DESC);
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY, filename text NOT NULL UNIQUE, original_name text NOT NULL,
  width integer NOT NULL, height integer NOT NULL, bytes integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY, admin_id uuid REFERENCES admins(id) ON DELETE SET NULL,
  action text NOT NULL, entity_id text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY, count integer NOT NULL DEFAULT 1, reset_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS website_content (
  id text PRIMARY KEY CHECK (id='main'), data jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO website_content(id) VALUES ('main') ON CONFLICT DO NOTHING;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'realty_anon') THEN
    CREATE ROLE realty_anon NOLOGIN;
  END IF;
END $$;
GRANT realty_anon TO CURRENT_USER;
GRANT USAGE ON SCHEMA public TO realty_anon;
REVOKE ALL ON leads FROM realty_anon;
GRANT INSERT (id, kind, name, email, phone, message, property_slug, property_type,
  property_location, property_size, consent) ON leads TO realty_anon;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS realty_lead_insert ON leads;
CREATE POLICY realty_lead_insert ON leads FOR INSERT TO realty_anon WITH CHECK (consent = true);
INSERT INTO schema_migrations(version) VALUES ('selfhost-v1') ON CONFLICT DO NOTHING;
INSERT INTO schema_migrations(version) VALUES ('website-content-v1') ON CONFLICT DO NOTHING;
