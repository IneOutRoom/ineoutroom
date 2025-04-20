import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { httpLogger } from "./middleware/httpLogger";
import { errorHandler } from "./middleware/errorHandler";
import { logger, logInfo } from "./utils/logger";
import { initializeSentry, sentryErrorHandler } from "./middleware/sentryMiddleware";
import path from "path";
import next from "next";
import { createServer } from "http";

// Inizializzazione di Next.js
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

// Funzione di log semplificata
const log = (message: string, source = "express") => {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
};

// Inizializzazione del server Express
const app = express();

// Route specifica per i webhook di Stripe - deve essere prima di altri middleware
// che modificano il body, per mantenere il raw body per la verifica della firma
const stripeWebhookPath = '/api/stripe-webhook';
app.use(stripeWebhookPath, express.raw({ type: 'application/json' }));

// Middleware standard per tutte le altre rotte
app.use((req, res, next) => {
  if (req.path === stripeWebhookPath) {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: false }));

// Middleware per il logging HTTP
app.use(httpLogger);

// Middleware per servire il service-worker.js con il corretto MIME type
app.get('/service-worker.js', (req, res, next) => {
  const swPath = path.join(import.meta.dirname, '..', 'public', 'service-worker.js');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(swPath, (err) => {
    if (err) {
      next(err);
    }
  });
});

// Middleware esistente per logging semplificato (manteniamo per retrocompatibilità)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Avvio dell'applicazione Next.js
nextApp.prepare().then(async () => {
  // Inizializza Sentry prima di registrare le rotte
  initializeSentry(app);
  
  // Registra le route API
  const server = await registerRoutes(app);

  // Middleware Sentry per la gestione degli errori (va prima di errorHandler)
  app.use(sentryErrorHandler);
  
  // Sostituiamo il precedente middleware di gestione errori con il nostro più avanzato
  app.use(errorHandler);

  // Passa tutte le altre richieste a Next.js
  app.all('*', (req, res) => {
    return nextHandler(req, res);
  });

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    // Log anche con il nostro sistema di logging strutturato
    logInfo(`Server avviato sulla porta ${port}`);
  });
});
