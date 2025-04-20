# Guida alla configurazione API di Google Maps

Per rendere funzionanti le mappe e la funzionalità Street View su In&Out, è necessario configurare correttamente l'API Key di Google Maps nella console Google Cloud.

## Passaggi per la configurazione

1. Accedi alla [Google Cloud Console](https://console.cloud.google.com/)

2. Seleziona il progetto utilizzato per il sito ineoutroom.eu

3. Nel menu di navigazione, vai a "APIs & Services" > "Credentials"

4. Trova la tua API Key esistente (o creane una nuova)

5. Clicca su "Edit API Key" (Modifica chiave API)

6. Nella sezione "Application restrictions" (Restrizioni applicazione), seleziona "HTTP referrers" (Referrer HTTP)

7. Aggiungi i seguenti domini alla lista dei domini autorizzati:
   - `https://ineoutroom.eu/*`
   - `https://*.ineoutroom.eu/*`
   - Il dominio di sviluppo Replit: `https://*.replit.dev/*` (questo per l'ambiente di sviluppo)
   - `http://localhost:*` (per test locali)

8. Nella sezione "API restrictions" (Restrizioni API), limita la chiave alle seguenti API:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Street View API

9. Clicca su "Save" (Salva)

## Verifica della fatturazione

È necessario che la fatturazione sia abilitata per il progetto Google Cloud. Anche se stai utilizzando il livello gratuito, è richiesta una carta di credito valida.

1. Nella console Google Cloud, vai a "Billing" (Fatturazione)
2. Verifica che il progetto abbia un account di fatturazione attivo
3. Se necessario, collega un account di fatturazione al progetto

## API da abilitare

Assicurati che le seguenti API siano abilitate nel tuo progetto:

1. Maps JavaScript API
2. Places API
3. Geocoding API
4. Street View API

Per abilitare un'API, vai a "APIs & Services" > "Library", cerca l'API desiderata e clicca su "Enable" (Abilita).

## Controllo quote e limiti

Le API di Google Maps hanno dei limiti di utilizzo gratuito. Superati questi limiti, verranno addebitati costi:

- Maps JavaScript API: 28.000 caricamenti di mappe al mese
- Geocoding API: 40.000 richieste al mese
- Places API: varie quote per diversi tipi di richieste

È consigliabile impostare dei limiti di quota giornalieri per evitare addebiti imprevisti.

## Controllo implementazione

Dopo aver configurato correttamente l'API Key, verifica che tutto funzioni visitando:

- Pagina principale delle mappe: `/cartografia`
- Test autocomplete indirizzo
- Test visualizzazione Street View

Se le mappe non dovessero ancora funzionare, controlla la console del browser per errori specifici.