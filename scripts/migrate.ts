import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '../shared/schema';

// Necessario per fare funzionare le WebSocket con Neon
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL non è impostato!');
    process.exit(1);
  }

  console.log('Inizializzazione del pool di connessione...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('Creazione delle tabelle nel database...');
  
  try {
    // Creazione di tutte le tabelle in ordine
    console.log('- Creazione della tabella users...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        subscription_plan TEXT,
        subscription_expires_at TIMESTAMP
      );
    `);

    console.log('- Creazione della tabella cities...');
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'country') THEN
          CREATE TYPE country AS ENUM ('IT', 'ES');
        END IF;
      END
      $$;

      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        country country NOT NULL,
        province TEXT,
        population INTEGER,
        latitude REAL,
        longitude REAL,
        is_popular BOOLEAN DEFAULT FALSE
      );
    `);

    console.log('- Creazione della tabella properties...');
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type') THEN
          CREATE TYPE property_type AS ENUM ('stanza_singola', 'stanza_doppia', 'monolocale', 'bilocale', 'altro');
        END IF;
      END
      $$;

      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        property_type property_type NOT NULL,
        price INTEGER NOT NULL,
        country country NOT NULL DEFAULT 'IT',
        city TEXT NOT NULL,
        address TEXT NOT NULL,
        zone TEXT,
        latitude REAL,
        longitude REAL,
        square_meters INTEGER,
        bathrooms INTEGER DEFAULT 1,
        bedrooms INTEGER DEFAULT 1,
        photos TEXT[],
        features JSONB,
        available_from TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL
      );
    `);

    console.log('- Creazione della tabella saved_searches...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_searches (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        search_criteria JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        notifications_enabled BOOLEAN DEFAULT TRUE NOT NULL
      );
    `);

    console.log('- Creazione della tabella messages...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id),
        sender_id INTEGER NOT NULL REFERENCES users(id),
        receiver_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_read BOOLEAN DEFAULT FALSE NOT NULL
      );
    `);

    console.log('- Creazione della tabella reviews...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        property_id INTEGER NOT NULL REFERENCES properties(id),
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        owner_response TEXT,
        helpful_count INTEGER DEFAULT 0,
        unhelpful_count INTEGER DEFAULT 0
      );
    `);

    console.log('- Creazione della tabella review_reports...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS review_reports (
        id SERIAL PRIMARY KEY,
        review_id INTEGER NOT NULL REFERENCES reviews(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        reason TEXT NOT NULL,
        details TEXT,
        status TEXT DEFAULT 'pending' NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMP,
        moderator_notes TEXT
      );
    `);

    console.log('- Creazione della tabella review_votes...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS review_votes (
        id SERIAL PRIMARY KEY,
        review_id INTEGER NOT NULL REFERENCES reviews(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        is_helpful BOOLEAN NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('- Creazione della tabella documents...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id),
        uploader_id INTEGER NOT NULL REFERENCES users(id),
        file_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type TEXT NOT NULL,
        file_url TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'contract' NOT NULL,
        is_template BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        expires_at TIMESTAMP
      );
    `);

    console.log('- Creazione della tabella signatures...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS signatures (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES documents(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        signature_url TEXT NOT NULL,
        signed_at TIMESTAMP NOT NULL DEFAULT NOW(),
        ip_address TEXT,
        user_agent TEXT
      );
    `);

    console.log('- Creazione della tabella user_interactions...');
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interaction_type') THEN
          CREATE TYPE interaction_type AS ENUM ('view', 'save', 'contact');
        END IF;
      END
      $$;

      CREATE TABLE IF NOT EXISTS user_interactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        property_id INTEGER NOT NULL REFERENCES properties(id),
        interaction_type interaction_type NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Creazione tabelle completata con successo!');

    // Crea un utente di test se non ne esistono
    console.log('Verifica presenza utente amministratore...');
    const { rows: users } = await pool.query('SELECT * FROM users LIMIT 1');
    if (users.length === 0) {
      console.log('Nessun utente trovato, creazione utente admin di test...');
      await pool.query(`
        INSERT INTO users (username, password, email) 
        VALUES ('admin', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 'admin@example.com')
      `);
      console.log('Utente admin creato con username: admin, password: secret');
    } else {
      console.log('Utente admin già esistente.');
    }

  } catch (error) {
    console.error('Errore durante la creazione delle tabelle:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);