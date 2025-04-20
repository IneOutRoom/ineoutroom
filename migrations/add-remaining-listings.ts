import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Iniziando migrazione per aggiungere il campo remainingListings...');

  try {
    // Verifica se la colonna esiste già
    const checkColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'remaining_listings'
    `);

    if (checkColumn.rows.length === 0) {
      // La colonna non esiste, la aggiungiamo
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS remaining_listings INTEGER DEFAULT 0
      `);
      console.log('✅ Campo remainingListings aggiunto con successo');
    } else {
      console.log('Campo remainingListings già esistente, nessuna modifica necessaria');
    }

    // Verifica anche il campo usedFreeListing se non esiste
    const checkFreeListing = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'used_free_listing'
    `);

    if (checkFreeListing.rows.length === 0) {
      // La colonna non esiste, la aggiungiamo
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS used_free_listing BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Campo usedFreeListing aggiunto con successo');
    } else {
      console.log('Campo usedFreeListing già esistente, nessuna modifica necessaria');
    }

    console.log('Migrazione completata con successo');

  } catch (error) {
    console.error('Errore durante la migrazione:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();