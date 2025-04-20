# IneOutRoom

Repository ufficiale del progetto IneOutRoom - Piattaforma di ricerca stanze in Europa.

## Descrizione

IneOutRoom è una piattaforma innovativa che permette di cercare e pubblicare annunci di stanze in affitto nelle principali città europee.

## Tecnologie

- Next.js
- React
- TypeScript
- Tailwind CSS

![Logo In&Out Room](./attached_assets/Modern%20Minimalist%20Graffiti%20Dream%20Brand%20Logo.png)

## Caratteristiche principali

- **Ricerca geospaziale completa**: Trova alloggi in base alla posizione con mappe interattive
- **Autenticazione utente**: Supporto per login tramite Google e email/password
- **Tecnologie di matching intelligenti**: Sistema di raccomandazione basato su machine learning
- **Gestione annunci**: Pubblica, gestisci e cerca annunci di alloggi
- **Sistema di recensioni**: Valutazioni degli utenti con "casette colorate" stile Airbnb
- **Integrazione pagamenti**: Tramite Stripe per abbonamenti e pacchetti annunci
- **Generazione AI di contenuti**: Creazione automatica di titoli e descrizioni per annunci
- **Gestione GDPR**: Sistema completo di gestione privacy e cookie

## Stack tecnologico

- **Frontend**: Next.js con React e TypeScript
- **Autenticazione**: Firebase Authentication
- **Stile**: Tailwind CSS per design responsive
- **Mappe**: Google Maps API con integrazione AutocompleteSuggestion
- **Machine Learning**: Servizi ML per raccomandazioni e dynamic pricing
- **Pagamenti**: Integrazione Stripe
- **Monitoraggio**: Sentry per tracking degli errori e performance

## Installazione e configurazione

### Prerequisiti
- Node.js (v16+)
- Account Firebase
- Account Stripe (per funzionalità di pagamento)
- Account Google Cloud Platform (per Google Maps API)
- Account Sentry (per monitoraggio errori)

### Configurazione

1. Clona il repository
2. Installa le dipendenze: `npm install`
3. Crea un file `.env.local` con le seguenti variabili:

```
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Stripe
VITE_STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# OpenAI
OPENAI_API_KEY=

# Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Database
DATABASE_URL=
```

4. Avvia il server di sviluppo: `npm run dev`

## Demo

Visita [ineoutroom.eu](https://ineoutroom.eu) per vedere il sito in azione.

## Stato del progetto

Attualmente in fase di migrazione da Vite a Next.js per migliorare SEO e performance.

## Licenza

© 2025 In&Out Room. Tutti i diritti riservati.