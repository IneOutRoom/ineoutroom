# Rapporto sui Test Automatizzati - In&Out

## Panoramica
Questa suite di test implementa test automatizzati a tutti i livelli per garantire la qualità e l'affidabilità della piattaforma In&Out.

## Struttura dei Test

### Test Unitari
I test unitari verificano il corretto funzionamento dei singoli componenti in isolamento:

- **UI Components**
  - `Button.test.jsx`: Test del componente Button 
  - `SearchBox.test.jsx`: Test del componente SearchBox
  - `AIAssistant.test.jsx`: Test dell'assistente virtuale AI
  - `PriceSuggestion.test.jsx`: Test del sistema di suggerimento prezzi
  - `ChatComponent.test.jsx`: Test del componente di chat in tempo reale

- **Services**
  - `OpenAIService.test.js`: Test del servizio di integrazione con OpenAI
  - `StripeIntegration.test.js`: Test del servizio di pagamenti Stripe
  - `LoggingSystem.test.js`: Test del sistema di logging e monitoraggio

### Test di Integrazione
I test di integrazione verificano l'interazione tra diversi componenti:

- `auth.test.js`: Test delle API di autenticazione (registrazione, login, logout)
- `property.test.js`: Test delle API di gestione proprietà (CRUD)
- `reviews.test.js`: Test del sistema di recensioni e voti
- `recommendations.test.js`: Test del sistema di raccomandazione proprietà

### Test End-to-End (E2E)
I test E2E con Cypress verificano il funzionamento dell'applicazione completa:

- `auth.spec.js`: Test del flusso di autenticazione da UI
- `property-search.spec.js`: Test del sistema di ricerca proprietà
- `documents.spec.js`: Test della gestione documenti e contratti

## Configurazione dell'Ambiente di Test

- `jest.unit.config.js`: Configurazione per test unitari
- `jest.integration.config.js`: Configurazione per test di integrazione
- `jest.setup.js`: Setup globale per test Jest
- `jest.integration.setup.js`: Setup specifico per test di integrazione
- `cypress.json`: Configurazione per test Cypress
- `__mocks__/`: Directory contenente mock per file e stili

## Script di Esecuzione Test

- `scripts/test-unit.sh`: Esecuzione test unitari
- `scripts/test-integration.sh`: Esecuzione test di integrazione
- `scripts/test-all.sh`: Esecuzione di tutti i test
- `scripts/test-coverage.sh`: Generazione report di copertura

## Copertura del codice
Obiettivo di copertura minima: 70% per statements, branch, funzioni e linee.

## Tecnologie Utilizzate

- Jest: Framework di test principale
- React Testing Library: Test dei componenti React
- Supertest: Test delle API HTTP
- Cypress: Test End-to-End
- Mock Service Worker (MSW): Intercettazione delle richieste HTTP nei test

## Prossimi Passi

1. Migliorare la copertura dei test in aree critiche come il sistema di pagamenti
2. Implementare una pipeline CI/CD per esecuzione automatica dei test
3. Aggiungere test per le nuove funzionalità in sviluppo
4. Configurare test di performance e load testing