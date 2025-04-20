# Guida alla Migrazione a Next.js per In&Out

## Stato Attuale della Migrazione

Abbiamo iniziato la migrazione della piattaforma In&Out a Next.js per migliorare SEO, performance e user experience. 

### Componenti Completati:
- ✅ Configurazione base Next.js con next.config.js
- ✅ Pagina Home con getStaticProps
- ✅ Pagina Dettaglio Annuncio con getStaticProps e getStaticPaths
- ✅ Pagina di Ricerca Annunci con getStaticProps
- ✅ Meta tag SEO dinamici e Open Graph

### Da Completare:
- ❌ Pagine rimanenti (auth, checkout, profilo utente, ecc.)
- ❌ Gestione API routes (per sostituire Express)
- ❌ Ottimizzazione immagini con next/image
- ❌ Deployment su Vercel o altro provider

## Struttura del Progetto

```
/
├── client/               # Vecchio client React
├── pages/                # Nuove pagine Next.js
│   ├── _app.js           # Componente App principale
│   ├── _document.js      # Personalizzazione HTML
│   ├── index.js          # Homepage
│   ├── search.js         # Pagina ricerca
│   └── annunci/
│       └── [id].js       # Pagina dettaglio annuncio
├── next.config.js        # Configurazione Next.js
└── vercel.json           # Configurazione Vercel per il deploy
```

## Come Testare il Progetto

Per testare la versione Next.js in locale, esegui:

```bash
# Terminal 1: Avvia il server API Express
npm run dev

# Terminal 2: Avvia il client Next.js
npm run next:dev
```

Poi visita http://localhost:3000 per vedere la versione Next.js del sito.

## Vantaggi della Migrazione

1. **SEO Migliorato**: Rendering lato server (SSR) e generazione statica (SSG)
2. **Performance**: Pre-rendering e ottimizzazione automatica
3. **UX Migliorata**: Navigazione più veloce e transizioni fluide
4. **Scalabilità**: Migliore architettura per la crescita futura

## Prossimi Passi

1. **Completare Tutte le Pagine**: Migrare tutte le pagine rimanenti
2. **API Routes**: Creare API routes Next.js per sostituire il server Express
3. **Ottimizzazione Asset**: Implementare next/image e Incremental Static Regeneration
4. **Testing**: Scrivere test per le nuove funzionalità
5. **Deployment**: Configurare CI/CD e deployment su Vercel

## Edge Caching (CDN)

È stata già implementata la configurazione per l'edge caching in `vercel.json`:

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/(.*)",
      "headers": {
        "cache-control": "s-maxage=60, stale-while-revalidate=300"
      },
      "continue": true
    },
    {
      "src": "/(annunci|search)/(.*)",
      "headers": {
        "cache-control": "s-maxage=3600, stale-while-revalidate=86400"
      },
      "continue": true
    }
  ]
}
```

Questo permette di distribuire le richieste API e le pagine principali su CDN, riducendo il carico sul server e migliorando i tempi di risposta.

## Meta Tags Dinamici & Open Graph

Ogni pagina ora include meta tag SEO dinamici e Open Graph per una migliore condivisione sui social media:

```jsx
<Head>
  <title>{property.title} - In&Out</title>
  <meta name="description" content={metaDescription} />
  <meta property="og:title" content={metaTitle} />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:image" content={metaImage} />
  <meta property="og:type" content="article" />
</Head>
```

## Considerazioni per il Deployment

Per il deployment su Vercel:

1. Connetti il repository GitHub a Vercel
2. Configura le variabili di ambiente necessarie
3. Esegui il deploy del progetto

Per un deployment su server personalizzato, usa:

```bash
npm run next:build
npm run next:start
```

## Note Tecniche

- **Persistent Data**: Il database continuerà a essere gestito tramite Neon DB
- **API Endpoints**: Per ora continueremo a usare Express, ma successivamente migreremo alle API routes di Next.js
- **Autenticazione**: L'autenticazione dovrà essere aggiornata per funzionare con Next.js tramite NextAuth.js