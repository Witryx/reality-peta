CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('contact','valuation','property_inquiry')),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 40),
  message text CHECK (message IS NULL OR char_length(message) <= 3000),
  property_slug text CHECK (property_slug IS NULL OR char_length(property_slug) <= 200),
  property_type text CHECK (property_type IS NULL OR char_length(property_type) <= 80),
  property_location text CHECK (property_location IS NULL OR char_length(property_location) <= 200),
  property_size text CHECK (property_size IS NULL OR char_length(property_size) <= 40),
  consent boolean NOT NULL DEFAULT false CHECK (consent = true),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);