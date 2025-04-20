// Qui possiamo importare e avviare il server per i test di integrazione
const { app } = require('./server');
const { pool } = require('./server/db');

// Chiusura del pool di connessione dopo l'esecuzione di tutti i test
afterAll(async () => {
  await pool.end();
});

// Aumentare il timeout per i test di integrazione
jest.setTimeout(30000);

// Sopprimere i console.log durante i test
global.console = {
  ...console,
  // Commenta la riga sotto per vedere i log durante i test
  log: jest.fn(),
  // Mantenere error e warn per il debug
  error: console.error,
  warn: console.warn,
  info: console.info,
};

// Esporta app per i test
global.app = app;