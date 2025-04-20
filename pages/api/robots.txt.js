import fs from 'fs';
import path from 'path';

/**
 * API Route: /api/robots.txt
 * Serve il file robots.txt generato
 */
export default function handler(req, res) {
  try {
    // Percorso del file robots.txt
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    
    // Verifica se il file esiste
    if (fs.existsSync(robotsPath)) {
      // Leggi il contenuto del file
      const robots = fs.readFileSync(robotsPath, 'utf8');
      
      // Imposta l'header Content-Type appropriato
      res.setHeader('Content-Type', 'text/plain');
      
      // Invia il file
      return res.status(200).send(robots);
    } else {
      // Se il file non esiste, crea un robots.txt di base
      const defaultRobots = `# https://ineoutroom.eu/robots.txt
# Il file robots.txt specifica le regole di accesso ai crawler dei motori di ricerca

# Permette a tutti i crawler di accedere a tutte le risorse del sito
User-agent: *
Allow: /

# Disabilita l'accesso a specifiche pagine private
Disallow: /profilo
Disallow: /documenti
Disallow: /admin
Disallow: /api/
Disallow: /_next/

# Indirizzo del sitemap
Sitemap: https://ineoutroom.eu/sitemap.xml`;
      
      // Imposta l'header Content-Type appropriato
      res.setHeader('Content-Type', 'text/plain');
      
      // Invia il file di default
      return res.status(200).send(defaultRobots);
    }
  } catch (error) {
    console.error('Errore nel servire il robots.txt:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}