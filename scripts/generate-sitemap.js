import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import dotenv from 'dotenv';

// Ottieni il percorso corrente per moduli ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carica le variabili d'ambiente dal file .env.local se esistente
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback alle variabili d'ambiente standard

async function generateSitemap() {
  console.log('Generating sitemap...');
  
  // Percorso base del sito
  const hostname = process.env.NEXT_PUBLIC_SITE_URL || 'https://ineoutroom.eu';
  
  try {
    // Inizializza una stream leggibile con le URL statiche del sito
    const staticUrls = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/search', changefreq: 'daily', priority: 0.9 },
      { url: '/auth', changefreq: 'monthly', priority: 0.6 },
      { url: '/profilo', changefreq: 'weekly', priority: 0.7 },
      { url: '/documenti', changefreq: 'monthly', priority: 0.5 },
      { url: '/terms', changefreq: 'yearly', priority: 0.3 },
      { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
      { url: '/cookie-policy', changefreq: 'yearly', priority: 0.3 },
    ];
    
    // Configura il client del database
    neonConfig.webSocketConstructor = ws;
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL mancante nelle variabili d\'ambiente');
    }
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    try {
      // Ottiene tutte le proprietà dal database
      const result = await pool.query(
        'SELECT id, created_at FROM properties'
      );
      
      // Crea lo stream per il sitemap
      const smStream = new SitemapStream({ hostname });
      
      // Aggiungi le URL statiche
      staticUrls.forEach(url => smStream.write(url));
      
      // Aggiungi le URL delle proprietà
      if (result && result.rows) {
        result.rows.forEach(property => {
          smStream.write({
            url: `/annunci/${property.id}`,
            lastmod: property.created_at ? new Date(property.created_at).toISOString() : undefined,
            changefreq: 'weekly',
            priority: 0.8
          });
        });
      }
      
      // Chiudi lo stream
      smStream.end();
      
      // Genera il sitemap
      const sitemap = await streamToPromise(smStream);
      
      // Assicurati che la directory public esista
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      // Scrivi il sitemap in un file
      fs.writeFileSync(
        path.join(publicDir, 'sitemap.xml'),
        sitemap.toString()
      );
      
      console.log('Sitemap generato con successo in public/sitemap.xml');
    } finally {
      // Chiudi il pool di connessione al database
      await pool.end();
    }
  } catch (error) {
    console.error('Errore durante la generazione del sitemap:', error);
    process.exit(1);
  }
}

// Esegui la funzione principale
generateSitemap();