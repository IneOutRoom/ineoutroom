-- Aggiorna l'enum country per includere tutti i paesi europei
DO $$
BEGIN
  -- Crea un backup dell'enum esistente
  ALTER TYPE country RENAME TO country_old;
  
  -- Crea il nuovo enum con tutti i paesi
  CREATE TYPE country AS ENUM (
    'AT', -- Austria
    'BE', -- Belgio
    'BG', -- Bulgaria
    'CY', -- Cipro
    'HR', -- Croazia
    'DK', -- Danimarca
    'EE', -- Estonia
    'FI', -- Finlandia
    'FR', -- Francia
    'DE', -- Germania
    'GR', -- Grecia
    'IE', -- Irlanda
    'IT', -- Italia
    'LV', -- Lettonia
    'LT', -- Lituania
    'LU', -- Lussemburgo
    'MT', -- Malta
    'NL', -- Paesi Bassi
    'PL', -- Polonia
    'PT', -- Portogallo
    'CZ', -- Repubblica Ceca
    'RO', -- Romania
    'SK', -- Slovacchia
    'SI', -- Slovenia
    'ES', -- Spagna
    'SE', -- Svezia
    'HU', -- Ungheria
    -- Altri paesi europei non UE
    'AL', -- Albania
    'AD', -- Andorra
    'BY', -- Bielorussia
    'BA', -- Bosnia ed Erzegovina
    'VA', -- Città del Vaticano
    'IS', -- Islanda
    'LI', -- Liechtenstein
    'MK', -- Macedonia del Nord
    'MD', -- Moldova
    'MC', -- Monaco
    'ME', -- Montenegro
    'NO', -- Norvegia
    'UK', -- Regno Unito
    'RS', -- Serbia
    'CH', -- Svizzera
    'UA'  -- Ucraina
  );
  
  -- Aggiorna le tabelle che utilizzano il tipo country
  ALTER TABLE cities 
    ALTER COLUMN country TYPE country USING country::text::country;
  
  ALTER TABLE properties 
    ALTER COLUMN country TYPE country USING country::text::country;
    
  -- Elimina il vecchio enum
  DROP TYPE country_old;
END$$;

-- Aggiunge i nomi dei paesi in italiano alla tabella di traduzione
CREATE TABLE IF NOT EXISTS country_translations (
  country_code TEXT PRIMARY KEY,
  name_it TEXT NOT NULL
);

-- Inserisce le traduzioni in italiano per tutti i paesi europei
INSERT INTO country_translations (country_code, name_it) VALUES
('AT', 'Austria'),
('BE', 'Belgio'),
('BG', 'Bulgaria'),
('CY', 'Cipro'),
('HR', 'Croazia'),
('DK', 'Danimarca'),
('EE', 'Estonia'),
('FI', 'Finlandia'),
('FR', 'Francia'),
('DE', 'Germania'),
('GR', 'Grecia'),
('IE', 'Irlanda'),
('IT', 'Italia'),
('LV', 'Lettonia'),
('LT', 'Lituania'),
('LU', 'Lussemburgo'),
('MT', 'Malta'),
('NL', 'Paesi Bassi'),
('PL', 'Polonia'),
('PT', 'Portogallo'),
('CZ', 'Repubblica Ceca'),
('RO', 'Romania'),
('SK', 'Slovacchia'),
('SI', 'Slovenia'),
('ES', 'Spagna'),
('SE', 'Svezia'),
('HU', 'Ungheria'),
('AL', 'Albania'),
('AD', 'Andorra'),
('BY', 'Bielorussia'),
('BA', 'Bosnia ed Erzegovina'),
('VA', 'Città del Vaticano'),
('IS', 'Islanda'),
('LI', 'Liechtenstein'),
('MK', 'Macedonia del Nord'),
('MD', 'Moldova'),
('MC', 'Monaco'),
('ME', 'Montenegro'),
('NO', 'Norvegia'),
('UK', 'Regno Unito'),
('RS', 'Serbia'),
('CH', 'Svizzera'),
('UA', 'Ucraina')
ON CONFLICT (country_code) DO UPDATE SET name_it = EXCLUDED.name_it;