-- Migration: add_plan_5_listings
-- Aggiunge il nuovo piano "5 inserzioni a 0,99 €" e imposta i campi necessari

INSERT INTO plans (id, name, max_listings, price, billing_interval)
VALUES (
  gen_random_uuid(),
  '5 Inserzioni',
  5,
  0.99,
  'once'
);

-- Aggiungiamo una colonna alla tabella utenti per tracciare se hanno già usato l'inserzione gratuita
-- Solo se la colonna non esiste già
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'used_free_listing'
  ) THEN
    ALTER TABLE users ADD COLUMN used_free_listing BOOLEAN DEFAULT FALSE;
  END IF;
END $$;