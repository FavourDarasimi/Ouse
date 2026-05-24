ALTER TABLE listings ADD COLUMN rent_type text NOT NULL DEFAULT 'monthly' CHECK (rent_type IN ('monthly', 'yearly'));
