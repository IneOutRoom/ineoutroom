import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    console.log('Verificando se la colonna email_verified esiste...');
    
    // Verifica se la colonna esiste già
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email_verified'
      ) AS "exists";
    `);
    
    console.log('Risultato query:', result);
    const exists = result[0]?.exists === true;
    
    if (exists) {
      console.log('La colonna email_verified esiste già.');
      return;
    }

    console.log('Aggiungendo la colonna email_verified...');
    
    // Aggiungi la colonna email_verified
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;
    `);
    
    console.log('Colonna email_verified aggiunta con successo!');
  } catch (error) {
    console.error('Errore durante la migrazione:', error);
    process.exit(1);
  }
}

main().then(() => {
  console.log('Migrazione completata.');
  process.exit(0);
}).catch(err => {
  console.error('Errore fatale:', err);
  process.exit(1);
});