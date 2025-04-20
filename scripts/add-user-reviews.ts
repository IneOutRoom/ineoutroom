/**
 * Script di migrazione per creare la tabella delle recensioni degli inserzionisti
 */
import { pgTable, serial, integer, text, decimal, timestamp, index } from 'drizzle-orm/pg-core';
import { db, pool } from '../server/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    console.log("Verificando se la tabella user_reviews esiste...");
    
    // Controllo se la tabella esiste già
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_reviews'
      )
    `);
    
    console.log("Risultato query:", tableExists);
    
    if (tableExists.rows[0].exists) {
      console.log("La tabella user_reviews esiste già.");
      return;
    }
    
    console.log("Creando la tabella user_reviews...");
    
    // Creo la tabella
    await pool.query(`
      CREATE TABLE user_reviews (
        id SERIAL PRIMARY KEY,
        inserzionist_id INTEGER NOT NULL,
        author_id INTEGER NOT NULL,
        rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_review UNIQUE (inserzionist_id, author_id)
      )
    `);
    
    console.log("Tabella user_reviews creata con successo!");
    
    console.log("Creando indici...");
    
    // Creo gli indici
    await pool.query(`
      CREATE INDEX idx_user_reviews_inserzionist_id ON user_reviews (inserzionist_id);
      CREATE INDEX idx_user_reviews_author_id ON user_reviews (author_id);
    `);
    
    console.log("Indici creati con successo!");
    
  } catch (error) {
    console.error("Errore durante la migrazione:", error);
    process.exit(1);
  } finally {
    console.log("Migrazione completata.");
    await pool.end();
  }
}

main();