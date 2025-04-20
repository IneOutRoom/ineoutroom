import fs from 'fs';
import path from 'path';

/**
 * API Route: /api/sitemap.xml
 * Serve il file sitemap.xml generato
 */
export default function handler(req, res) {
  try {
    // Percorso del file sitemap.xml
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    
    // Verifica se il file esiste
    if (fs.existsSync(sitemapPath)) {
      // Leggi il contenuto del file
      const sitemap = fs.readFileSync(sitemapPath, 'utf8');
      
      // Imposta l'header Content-Type appropriato
      res.setHeader('Content-Type', 'application/xml');
      
      // Invia il file
      return res.status(200).send(sitemap);
    } else {
      // Se il file non esiste, restituisci un errore 404
      return res.status(404).json({
        error: 'Sitemap non trovato. Esegui prima lo script di generazione.'
      });
    }
  } catch (error) {
    console.error('Errore nel servire il sitemap:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}