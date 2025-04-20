import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  propertySearchSchema, insertMessageSchema, insertReviewSchema,
  insertDocumentSchema, insertSignatureSchema, insertUserInteractionSchema,
  insertFavoriteSchema, users, favorites, properties
} from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { 
  canPublishListing,
  markFreeListingAsUsed,
  processListingsPackagePurchase,
  updateUserSubscription
} from "./services/subscriptionService";
import { searchProperties, getPropertiesForMap } from "./controllers/propertyController";
import { trackAPIPerformance } from "./middleware/sentryPerformance";

// Schema di convalida per la risposta alle recensioni
const reviewResponseSchema = z.object({
  reviewId: z.number(),
  response: z.string().min(1, "La risposta non può essere vuota").max(500, "La risposta non può superare i 500 caratteri")
});
import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import { registerAdminRoutes } from "./routes/admin";
import { registerAuthRoutes } from "./routes/authRoutes";
import performanceRoutes from "./routes/performanceRoutes";
import aiRoutes from "./routes/ai";
import seedRoutes from "./routes/seed";
import openaiRoutes from "./routes/openai";
import reviewsRoutes from "./routes/reviewsRoutes";
import sentryToolsRoutes from "./routes/sentryTools";
import staticToolsRoutes from "./routes/staticTools";
import { calculatePriceStatistics, getPriceSuggestion } from "./services/pricingService";
import { generateDescription, generateTitleSuggestions } from "./services/descriptionGenerator";
import announcementsRoutes from "./api/announcements";

export async function registerRoutes(app: Express): Promise<Server> {
  // Imposta l'autenticazione
  setupAuth(app);
  
  // Registra le route di autenticazione Google
  registerAuthRoutes(app);
  
  // API per il profilo utente
  app.get("/api/users/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Non autorizzato" });
    }
    
    // Restituisci i dati utente dalla sessione, senza la password
    const user = { ...req.user } as any;
    if (user && 'password' in user) {
      delete user.password;
    }
    
    return res.json(user);
  });
  
  app.put("/api/users/me", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Non autorizzato" });
    }
    
    const userId = req.user.id;
    
    try {
      const {
        name,
        surname,
        phone,
        bio,
        hasVat,
        vatNumber,
      } = req.body;
      
      // Verifica e prepara i dati da aggiornare
      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name;
      if (surname !== undefined) updateData.surname = surname;
      if (phone !== undefined) updateData.phone = phone;
      if (bio !== undefined) updateData.bio = bio;
      if (hasVat !== undefined) updateData.hasVat = hasVat;
      if (vatNumber !== undefined) updateData.vatNumber = vatNumber;
      
      // Aggiorna l'email solo se l'utente non ha un account Firebase collegato
      if (!req.user.firebaseUid && req.body.email !== undefined) {
        updateData.email = req.body.email;
      }
      
      // Aggiorna i dati utente utilizzando la storage
      const updatedUser = await db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (!updatedUser || updatedUser.length === 0) {
        return res.status(404).json({ error: "Utente non trovato" });
      }
      
      // Aggiorna la sessione con i nuovi dati utente
      req.login(updatedUser[0], (err) => {
        if (err) {
          return res.status(500).json({ error: "Errore durante l'aggiornamento della sessione" });
        }
        
        // Rimuovi la password dai dati utente prima di inviarli al client
        const responseUser = { ...updatedUser[0] } as any;
        if (responseUser && 'password' in responseUser) {
          delete responseUser.password;
        }
        
        return res.json(responseUser);
      });
    } catch (error) {
      console.error("Errore durante l'aggiornamento del profilo:", error);
      return res.status(500).json({ error: "Errore durante l'aggiornamento del profilo" });
    }
  });

  // Inizializza Stripe se la chiave API è disponibile
  let stripe: Stripe | undefined;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16" as any, // Risolve problema di tipizzazione con versioni API
    });
  }

  // API per la ricerca di proprietà
  app.post("/api/properties/search", trackAPIPerformance("property-search"), searchProperties);
  
  // API per la ricerca di proprietà sulla mappa
  app.post("/api/properties/map", trackAPIPerformance("map-properties"), getPropertiesForMap);

  // API per ottenere una proprietà specifica
  app.get("/api/properties/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID proprietà non valido" });
    }

    const property = await storage.getProperty(id);
    if (!property) {
      return res.status(404).json({ message: "Proprietà non trovata" });
    }

    res.json(property);
  });

  // API per creare una nuova proprietà (richiede autenticazione)
  app.post("/api/properties", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    try {
      // Verifica se l'utente può pubblicare l'annuncio
      const userId = req.user!.id;
      const canPublish = await canPublishListing(userId);
      
      if (!canPublish) {
        return res.status(403).json({ 
          message: "Non hai diritti sufficienti per pubblicare un annuncio",
          details: "Verifica il tuo piano di abbonamento o acquista pacchetti aggiuntivi"
        });
      }
      
      const propertyData = { ...req.body, userId: userId };
      const property = await storage.createProperty(propertyData);
      
      // Aggiorna i crediti dell'utente in base al tipo di utilizzo
      const user = req.user!;
      
      if (user.usedFreeListing !== true) {
        // Se è la prima inserzione gratuita
        await markFreeListingAsUsed(userId);
      } else if (user.remainingListings && user.remainingListings > 0) {
        // Se sta usando un pacchetto di inserzioni
        await db
          .update(users)
          .set({ remainingListings: user.remainingListings - 1 })
          .where(eq(users.id, userId));
      }
      
      res.status(201).json(property);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // API per aggiornare una proprietà (richiede autenticazione)
  app.put("/api/properties/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID proprietà non valido" });
    }

    const property = await storage.getProperty(id);
    if (!property) {
      return res.status(404).json({ message: "Proprietà non trovata" });
    }

    if (property.userId !== req.user!.id) {
      return res.status(403).json({ message: "Non autorizzato" });
    }

    try {
      const updatedProperty = await storage.updateProperty(id, req.body);
      res.json(updatedProperty);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // API per eliminare una proprietà (richiede autenticazione)
  app.delete("/api/properties/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID proprietà non valido" });
    }

    const property = await storage.getProperty(id);
    if (!property) {
      return res.status(404).json({ message: "Proprietà non trovata" });
    }

    if (property.userId !== req.user!.id) {
      return res.status(403).json({ message: "Non autorizzato" });
    }

    const success = await storage.deleteProperty(id);
    if (success) {
      res.sendStatus(204);
    } else {
      res.status(500).json({ message: "Errore durante l'eliminazione" });
    }
  });

  // API per ottenere le ricerche salvate dell'utente (richiede autenticazione)
  app.get("/api/saved-searches", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const savedSearches = await storage.getSavedSearchesByUser(req.user!.id);
    res.json(savedSearches);
  });

  // API per creare una nuova ricerca salvata (richiede autenticazione)
  app.post("/api/saved-searches", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    try {
      const savedSearchData = { ...req.body, userId: req.user!.id };
      const savedSearch = await storage.createSavedSearch(savedSearchData);
      res.status(201).json(savedSearch);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // API per eliminare una ricerca salvata (richiede autenticazione)
  app.delete("/api/saved-searches/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID ricerca non valido" });
    }

    const savedSearch = await storage.getSavedSearch(id);
    if (!savedSearch) {
      return res.status(404).json({ message: "Ricerca salvata non trovata" });
    }

    if (savedSearch.userId !== req.user!.id) {
      return res.status(403).json({ message: "Non autorizzato" });
    }

    const success = await storage.deleteSavedSearch(id);
    if (success) {
      res.sendStatus(204);
    } else {
      res.status(500).json({ message: "Errore durante l'eliminazione" });
    }
  });

  // Stripe - Creazione di un intent di pagamento per singolo annuncio
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe non configurato" });
    }

    try {
      const { amount, plan } = req.body;
      let amountInCents;
      let metadata: any = {};

      if (plan) {
        metadata.plan = plan;
      }

      switch (plan) {
        case '5listings':
          amountInCents = 99; // €0.99 per il pacchetto da 5 inserzioni
          metadata.listingPackage = '5';
          break;
        case 'standard':
          amountInCents = 599; // €5.99
          break;
        case 'premium':
          amountInCents = 999; // €9.99
          break;
        default:
          amountInCents = amount * 100;
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Errore durante la creazione del pagamento: " + error.message });
    }
  });

  // API per verificare i diritti di pubblicazione dell'utente
  app.get("/api/user/publishing-rights", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    try {
      const userId = req.user!.id;
      const canPublish = await canPublishListing(userId);
      const user = req.user!;
      
      const hasActiveSubscription = 
        user.subscriptionPlan && 
        user.subscriptionExpiresAt && 
        new Date(user.subscriptionExpiresAt) > new Date();
      
      // Prima inserzione gratuita
      const hasFreeListing = user.usedFreeListing !== true;
      
      res.json({
        canPublish,
        hasFreeListing,
        hasActiveSubscription,
        subscriptionPlan: user.subscriptionPlan,
        expiresAt: user.subscriptionExpiresAt,
        remainingListings: user.remainingListings || 0
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Webhook per gli eventi Stripe
  app.post("/api/stripe-webhook", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe non configurato" });
    }
    
    const sig = req.headers['stripe-signature'] as string;

    // Questa dovrebbe essere una variabile d'ambiente segreta
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn("ATTENZIONE: STRIPE_WEBHOOK_SECRET non configurato. Skipping signature verification.");
    }
    
    let event;
    
    try {
      // Se abbiamo il segreto, verifichiamo la firma
      if (webhookSecret) {
        // Il body resta in formato raw grazie alla configurazione in server/index.ts
        event = stripe.webhooks.constructEvent(
          req.body, // raw body
          sig,
          webhookSecret
        );
      } else {
        // Altrimenti, assumiamo che il payload sia già un oggetto JSON (per sviluppo locale)
        // In questo caso, convertiamo il buffer al formato JSON
        const payloadString = req.body.toString('utf8');
        event = JSON.parse(payloadString);
      }
      
      // Gestione degli eventi
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          
          // Controlla se c'è un piano o pacchetto specifico
          if (paymentIntent.metadata?.plan === '5listings' || paymentIntent.metadata?.listingPackage === '5') {
            // Cerca l'utente associato al pagamento
            const customerId = paymentIntent.customer;
            
            if (customerId) {
              // Trova l'utente tramite l'ID cliente Stripe
              const [user] = await db
                .select()
                .from(users)
                .where(eq(users.stripeCustomerId, customerId));
              
              if (user) {
                // Aggiungi 5 inserzioni all'utente
                await processListingsPackagePurchase(user.id);
                console.log(`Aggiunte 5 inserzioni all'utente ${user.id}`);
              }
            }
          }
          break;
          
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object;
          
          // Aggiorna l'abbonamento dell'utente
          const customerId = subscription.customer;
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.stripeCustomerId, customerId));
          
          if (user) {
            const planId = subscription.items.data[0].price.id;
            let plan = 'standard';
            let listingsLimit = 30;
            
            // Determina il piano in base all'ID del prezzo
            if (planId === process.env.STRIPE_PRICE_PREMIUM) {
              plan = 'premium';
              listingsLimit = 1000; // valore alto per "illimitato"
            }
            
            // Calcola la data di scadenza (1 mese da oggi)
            const expirationDate = new Date();
            expirationDate.setMonth(expirationDate.getMonth() + 1);
            
            // Aggiorna l'abbonamento dell'utente
            await updateUserSubscription(user.id, plan, expirationDate, listingsLimit);
            console.log(`Aggiornato abbonamento utente ${user.id} a ${plan}`);
          }
          break;
      }
      
      res.send({ received: true });
    } catch (error: any) {
      console.error('Errore nel webhook Stripe:', error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  // Registra le rotte di amministrazione
  registerAdminRoutes(app);

  // Registra le rotte AI
  app.use('/api/ai', aiRoutes);
  
  // Registra le rotte di seeding (solo per dev)
  app.use('/api/seed', seedRoutes);
  
  // Registra le rotte per gli annunci
  app.use('/api/announcements', announcementsRoutes);
  
  // Registra le rotte OpenAI semplificate
  app.use('/api/openai', openaiRoutes);
  
  // Registra le rotte per le recensioni agli inserzionisti
  app.use('/api/reviews', reviewsRoutes);
  
  // Registra le rotte per i test di performance e monitoraggio
  app.use('/api', performanceRoutes);
  
  // Registra le rotte per gli strumenti di test Sentry
  app.use('/api/sentry', sentryToolsRoutes);
  
  // Registra le rotte per strumenti statici
  app.use('/tools', staticToolsRoutes);
  
  // API per ottenere la lista dei paesi
  app.get("/api/countries", trackAPIPerformance("get-countries"), async (req, res) => {
    try {
      const countries = await storage.getCountries();
      res.json(countries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API per ottenere la lista delle città
  app.get("/api/cities", trackAPIPerformance("get-cities"), async (req, res) => {
    try {
      const country = req.query.country as string | undefined;
      const cities = await storage.getCities(country);
      res.json(cities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe - Creazione o recupero di un abbonamento
  app.post("/api/get-or-create-subscription", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe non configurato" });
    }

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const user = req.user!;

    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        res.json({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });
        return;
      } catch (error) {
        // Subscription not found, create a new one
      }
    }

    try {
      // Crea o recupera il customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
        });
        customerId = customer.id;
        await storage.updateStripeCustomerId(user.id, customerId);
      }

      // Crea l'abbonamento
      const { plan } = req.body;
      let priceId;

      // Questi ID dovrebbero essere salvati nelle variabili d'ambiente
      switch (plan) {
        case 'standard':
          priceId = process.env.STRIPE_PRICE_STANDARD || 'price_standard';
          break;
        case 'premium':
          priceId = process.env.STRIPE_PRICE_PREMIUM || 'price_premium';
          break;
        default:
          return res.status(400).json({ message: "Piano non valido" });
      }

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(user.id, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Errore durante la creazione dell'abbonamento: " + error.message });
    }
  });

  // API per ottenere le chat dell'utente (richiede autenticazione)
  app.get("/api/chats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    try {
      const chats = await storage.getChats(req.user!.id);
      res.json(chats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API per ottenere i messaggi di una chat specifica (richiede autenticazione)
  app.get("/api/messages/:propertyId/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const propertyId = parseInt(req.params.propertyId);
    const otherUserId = parseInt(req.params.userId);
    
    if (isNaN(propertyId) || isNaN(otherUserId)) {
      return res.status(400).json({ message: "Parametri non validi" });
    }

    try {
      const messages = await storage.getMessagesByChat(propertyId, req.user!.id, otherUserId);
      
      // Segna i messaggi come letti
      await storage.markMessagesAsRead(propertyId, otherUserId, req.user!.id);
      
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API per inviare un nuovo messaggio (richiede autenticazione)
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user!.id
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server per chat in tempo reale
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Mappa per tenere traccia delle connessioni degli utenti
  const clients = new Map<number, WebSocket[]>();
  
  wss.on('connection', (ws: WebSocket) => {
    let userId: number | null = null;
    
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Autenticazione
        if (data.type === 'auth') {
          userId = data.userId;
          
          // Aggiungi la connessione alla mappa
          if (userId !== null) {
            if (!clients.has(userId)) {
              clients.set(userId, []);
            }
            clients.get(userId)?.push(ws);
          }
          
          ws.send(JSON.stringify({ type: 'auth_success' }));
        }
        
        // Nuovo messaggio
        else if (data.type === 'message' && userId) {
          // Salva il messaggio nel database
          const messageData = {
            propertyId: data.propertyId,
            senderId: userId,
            receiverId: data.receiverId,
            content: data.content
          };
          
          const savedMessage = await storage.createMessage(messageData);
          
          // Invia il messaggio al destinatario se è online
          const receiverSockets = clients.get(data.receiverId) || [];
          
          const messagePayload = JSON.stringify({
            type: 'new_message',
            message: savedMessage
          });
          
          // Invia a tutti i client connessi del destinatario
          receiverSockets.forEach(receiverWs => {
            if (receiverWs.readyState === WebSocket.OPEN) {
              receiverWs.send(messagePayload);
            }
          });
          
          // Conferma al mittente
          ws.send(JSON.stringify({
            type: 'message_sent',
            message: savedMessage
          }));
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Errore del server' }));
      }
    });
    
    ws.on('close', () => {
      if (userId) {
        // Rimuovi la connessione dalla mappa
        const userConnections = clients.get(userId) || [];
        const index = userConnections.indexOf(ws);
        if (index !== -1) {
          userConnections.splice(index, 1);
        }
        
        if (userConnections.length === 0) {
          clients.delete(userId);
        }
      }
    });
  });

  // API per ottenere recensioni di una proprietà
  app.get("/api/properties/:propertyId/reviews", async (req, res) => {
    const propertyId = parseInt(req.params.propertyId);
    if (isNaN(propertyId)) {
      return res.status(400).json({ message: "ID proprietà non valido" });
    }

    try {
      const reviews = await storage.getReviewsByProperty(propertyId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API per ottenere una recensione specifica
  app.get("/api/reviews/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID recensione non valido" });
    }

    try {
      const review = await storage.getReview(id);
      if (!review) {
        return res.status(404).json({ message: "Recensione non trovata" });
      }
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API per verificare se un utente ha già recensito una proprietà
  app.get("/api/properties/:propertyId/user-review", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const propertyId = parseInt(req.params.propertyId);
    if (isNaN(propertyId)) {
      return res.status(400).json({ message: "ID proprietà non valido" });
    }

    try {
      const review = await storage.getUserReviewForProperty(req.user.id, propertyId);
      res.json(review || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API per creare una recensione (richiede autenticazione)
  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // API per aggiornare una recensione (richiede autenticazione)
  app.put("/api/reviews/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID recensione non valido" });
    }

    const review = await storage.getReview(id);
    if (!review) {
      return res.status(404).json({ message: "Recensione non trovata" });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: "Non autorizzato a modificare questa recensione" });
    }

    try {
      const updatedReview = await storage.updateReview(id, req.body);
      res.json(updatedReview);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // API per eliminare una recensione (richiede autenticazione)
  app.delete("/api/reviews/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID recensione non valido" });
    }

    const review = await storage.getReview(id);
    if (!review) {
      return res.status(404).json({ message: "Recensione non trovata" });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: "Non autorizzato a eliminare questa recensione" });
    }

    try {
      const success = await storage.deleteReview(id);
      if (success) {
        res.sendStatus(204);
      } else {
        res.status(500).json({ message: "Errore durante l'eliminazione" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // API per rispondere a una recensione (richiede autenticazione e essere proprietario)
  app.post("/api/reviews/:id/respond", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const reviewId = parseInt(req.params.id);
    if (isNaN(reviewId)) {
      return res.status(400).json({ message: "ID recensione non valido" });
    }

    const review = await storage.getReview(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Recensione non trovata" });
    }

    const property = await storage.getProperty(review.propertyId);
    if (!property) {
      return res.status(404).json({ message: "Proprietà non trovata" });
    }

    // Verifica che l'utente sia il proprietario dell'immobile
    if (property.userId !== req.user.id) {
      return res.status(403).json({ message: "Solo il proprietario può rispondere alle recensioni" });
    }

    try {
      const { response } = reviewResponseSchema.parse({
        reviewId,
        response: req.body.response
      });
      
      // Aggiorna la recensione con la risposta
      const updatedReview = await storage.updateReview(reviewId, { ownerResponse: response });
      res.json(updatedReview);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // API per segnalare una recensione (richiede autenticazione)
  app.post("/api/reviews/:id/report", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const reviewId = parseInt(req.params.id);
    if (isNaN(reviewId)) {
      return res.status(400).json({ message: "ID recensione non valido" });
    }

    const review = await storage.getReview(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Recensione non trovata" });
    }

    // Un utente non può segnalare le proprie recensioni
    if (review.userId === req.user.id) {
      return res.status(400).json({ message: "Non puoi segnalare le tue recensioni" });
    }

    // Verifica se l'utente ha già segnalato questa recensione
    const existingReport = await storage.getUserReportForReview(req.user.id, reviewId);
    if (existingReport) {
      return res.status(400).json({ message: "Hai già segnalato questa recensione" });
    }

    try {
      const reportData = {
        reviewId,
        userId: req.user.id,
        reason: req.body.reason,
        details: req.body.details
      };
      
      const report = await storage.createReviewReport(reportData);
      res.status(201).json(report);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // API per valutare l'utilità di una recensione (richiede autenticazione)
  app.post("/api/reviews/:id/vote", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const reviewId = parseInt(req.params.id);
    if (isNaN(reviewId)) {
      return res.status(400).json({ message: "ID recensione non valido" });
    }

    const review = await storage.getReview(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Recensione non trovata" });
    }

    // Un utente non può votare le proprie recensioni
    if (review.userId === req.user.id) {
      return res.status(400).json({ message: "Non puoi votare le tue recensioni" });
    }

    const { isHelpful } = req.body;
    if (typeof isHelpful !== "boolean") {
      return res.status(400).json({ message: "Parametro 'isHelpful' mancante o non valido" });
    }

    try {
      // Verifica se l'utente ha già votato questa recensione
      const existingVote = await storage.getUserVoteForReview(req.user.id, reviewId);
      
      if (existingVote) {
        // L'utente sta cambiando il voto
        if (existingVote.isHelpful !== isHelpful) {
          // Aggiorna i contatori della recensione
          const updatedHelpful = (review.helpful || 0) + (isHelpful ? 1 : -1);
          const updatedUnhelpful = (review.unhelpful || 0) + (isHelpful ? -1 : 1);
          
          // Aggiorna il voto dell'utente
          await storage.updateReviewVote(existingVote.id, { isHelpful });
          
          // Aggiorna i contatori della recensione
          const updatedReview = await storage.updateReview(reviewId, {
            helpful: updatedHelpful,
            unhelpful: updatedUnhelpful
          });
          
          return res.json(updatedReview);
        }
        
        // L'utente sta tentando di dare lo stesso voto
        return res.status(400).json({ message: "Hai già votato questa recensione" });
      }
      
      // Nuovo voto
      await storage.createReviewVote({
        reviewId,
        userId: req.user.id,
        isHelpful
      });
      
      // Aggiorna i contatori della recensione
      const updatedReview = await storage.updateReview(reviewId, {
        helpful: isHelpful ? (review.helpful || 0) + 1 : (review.helpful || 0),
        unhelpful: isHelpful ? (review.unhelpful || 0) : (review.unhelpful || 0) + 1
      });
      
      res.status(201).json(updatedReview);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // API per ottenere tutti i documenti di una proprietà
  app.get("/api/properties/:id/documents", async (req, res) => {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({ message: "ID proprietà non valido" });
    }

    try {
      const documents = await storage.getDocumentsByProperty(propertyId);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API per ottenere i documenti dell'utente (caricati o da firmare)
  app.get("/api/user/documents", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    try {
      const role = req.query.role as 'uploader' | 'signer';
      const documents = await storage.getDocumentsByUser(req.user.id, role);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API per ottenere i documenti modello
  app.get("/api/documents/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplateDocuments();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API per ottenere un documento specifico
  app.get("/api/documents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID documento non valido" });
    }

    try {
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Documento non trovato" });
      }
      res.json(document);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API per creare un nuovo documento (richiede autenticazione)
  app.post("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    try {
      const documentData = insertDocumentSchema.parse({
        ...req.body,
        uploaderId: req.user.id
      });
      
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // API per aggiornare un documento (richiede autenticazione)
  app.put("/api/documents/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID documento non valido" });
    }

    try {
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Documento non trovato" });
      }

      // Solo l'uploader può modificare il documento
      if (document.uploaderId !== req.user.id) {
        return res.status(403).json({ message: "Non autorizzato" });
      }

      const updatedDocument = await storage.updateDocument(id, req.body);
      res.json(updatedDocument);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // API per eliminare un documento (richiede autenticazione)
  app.delete("/api/documents/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID documento non valido" });
    }

    try {
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Documento non trovato" });
      }

      // Solo l'uploader può eliminare il documento
      if (document.uploaderId !== req.user.id) {
        return res.status(403).json({ message: "Non autorizzato" });
      }

      const success = await storage.deleteDocument(id);
      if (success) {
        res.sendStatus(204);
      } else {
        res.status(500).json({ message: "Errore durante l'eliminazione" });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // API per ottenere le firme di un documento
  app.get("/api/documents/:id/signatures", async (req, res) => {
    const documentId = parseInt(req.params.id);
    if (isNaN(documentId)) {
      return res.status(400).json({ message: "ID documento non valido" });
    }

    try {
      const signatures = await storage.getSignaturesByDocument(documentId);
      res.json(signatures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API per firmare un documento (richiede autenticazione)
  app.post("/api/documents/:id/sign", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const documentId = parseInt(req.params.id);
    if (isNaN(documentId)) {
      return res.status(400).json({ message: "ID documento non valido" });
    }

    try {
      // Verifica che il documento esista
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Documento non trovato" });
      }

      // Verifica che l'utente non abbia già firmato
      const existingSignature = await storage.getUserSignatureForDocument(req.user.id, documentId);
      if (existingSignature) {
        return res.status(400).json({ message: "Hai già firmato questo documento" });
      }

      const signatureData = insertSignatureSchema.parse({
        ...req.body,
        userId: req.user.id,
        documentId,
        // Aggiunge informazioni sulla connessione
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null
      });
      
      const signature = await storage.createSignature(signatureData);
      res.status(201).json(signature);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // API per registrare un'interazione utente con una proprietà (richiede autenticazione)
  app.post("/api/interactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    try {
      const interactionData = insertUserInteractionSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const interaction = await storage.createUserInteraction(interactionData);
      res.status(201).json(interaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // API per ottenere le proprietà raccomandate per l'utente (richiede autenticazione)
  app.get("/api/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const recommendedProperties = await storage.getRecommendedProperties(req.user!.id, limit);
      res.json(recommendedProperties);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Endpoint per registrare interazioni degli utenti con le proprietà (visualizzazioni, salvataggi, ecc.)
  app.post("/api/user-interactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    try {
      const interactionData = insertUserInteractionSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const interaction = await storage.createUserInteraction(interactionData);
      res.status(201).json(interaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Endpoint per recuperare proprietà consigliate per l'utente
  app.get("/api/recommended-properties", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Autenticazione richiesta" });
      }
      
      const recommendedProperties = await storage.getRecommendedProperties(req.user.id);
      res.json(recommendedProperties);
    } catch (error: any) {
      console.error('Errore nel recupero delle proprietà consigliate:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Endpoint per recuperare proprietà simili a una proprietà specifica
  app.get("/api/properties/:propertyId/similar", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "ID proprietà non valido" });
      }
      
      const similarProperties = await storage.getSimilarProperties(propertyId);
      res.json(similarProperties);
    } catch (error: any) {
      console.error('Errore nel recupero delle proprietà simili:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Endpoint per calcolare le statistiche dei prezzi (protetto, solo admin)
  app.post("/api/admin/calculate-price-stats", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Accesso non autorizzato" });
      }
      
      const result = await calculatePriceStatistics();
      res.json(result);
    } catch (error: any) {
      console.error('Errore nel calcolo delle statistiche prezzi:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Endpoint per ottenere suggerimenti di prezzo
  app.get("/api/pricing-suggestion", async (req, res) => {
    try {
      const { city, zone, propertyType } = req.query;
      
      if (!city) {
        return res.status(400).json({ message: "Il parametro 'city' è obbligatorio" });
      }
      
      const suggestion = await getPriceSuggestion(
        city as string, 
        zone as string | null, 
        propertyType as string | null
      );
      
      res.json(suggestion);
    } catch (error: any) {
      console.error('Errore nel recupero del suggerimento prezzi:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Endpoint per generare una descrizione per un annuncio immobiliare
  app.post("/api/generate-description", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "API Key OpenAI non configurata" });
      }
      
      const propertyAttrs = req.body;
      
      if (!propertyAttrs.propertyType || !propertyAttrs.city) {
        return res.status(400).json({ 
          message: "I parametri 'propertyType' e 'city' sono obbligatori" 
        });
      }
      
      console.log('Richiesta generazione descrizione:', propertyAttrs);
      
      const description = await generateDescription(propertyAttrs);
      
      res.json({ description });
    } catch (error: any) {
      console.error('Errore nella generazione della descrizione:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Endpoint per generare suggerimenti per il titolo di un annuncio
  app.post("/api/generate-title-suggestions", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "API Key OpenAI non configurata" });
      }
      
      const propertyAttrs = req.body;
      
      if (!propertyAttrs.propertyType || !propertyAttrs.city) {
        return res.status(400).json({ 
          message: "I parametri 'propertyType' e 'city' sono obbligatori" 
        });
      }
      
      console.log('Richiesta generazione titoli:', propertyAttrs);
      
      const suggestions = await generateTitleSuggestions(propertyAttrs);
      
      res.json({ suggestions });
    } catch (error: any) {
      console.error('Errore nella generazione dei suggerimenti per il titolo:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // API per i preferiti
  // Ottieni i preferiti dell'utente
  app.get("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        error: "UNAUTHORIZED", 
        message: "È necessario effettuare l'accesso per accedere ai preferiti" 
      });
    }

    const userId = req.user!.id;
    
    try {
      const userFavorites = await db
        .select({
          favorite: favorites,
          property: properties
        })
        .from(favorites)
        .innerJoin(properties, eq(favorites.propertyId, properties.id))
        .where(eq(favorites.userId, userId))
        .orderBy(desc(favorites.createdAt));
      
      // Formatta i risultati per restituire solo le proprietà con l'id del preferito
      const formattedFavorites = userFavorites.map(item => ({
        favoriteId: item.favorite.id,
        ...item.property
      }));
      
      res.json(formattedFavorites);
    } catch (error: any) {
      console.error("Errore nel recupero dei preferiti:", error);
      res.status(500).json({ 
        error: "SERVER_ERROR", 
        message: error.message || "Si è verificato un errore nel recupero dei preferiti" 
      });
    }
  });
  
  // Aggiungi un preferito
  app.post("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        error: "UNAUTHORIZED", 
        message: "È necessario effettuare l'accesso per aggiungere ai preferiti" 
      });
    }
    
    try {
      const { propertyId } = insertFavoriteSchema.parse(req.body);
      const userId = req.user!.id;
      
      // Verifica che la proprietà esista
      const propertyExists = await db
        .select()
        .from(properties)
        .where(eq(properties.id, propertyId));
      
      if (propertyExists.length === 0) {
        return res.status(404).json({
          error: "NOT_FOUND",
          message: "Proprietà non trovata"
        });
      }
      
      // Verifica se esiste già il preferito
      const existingFavorite = await db
        .select()
        .from(favorites)
        .where(
          and(
            eq(favorites.userId, userId),
            eq(favorites.propertyId, propertyId)
          )
        );
      
      if (existingFavorite.length > 0) {
        return res.status(409).json({
          error: "ALREADY_EXISTS",
          message: "Questa proprietà è già nei tuoi preferiti"
        });
      }
      
      // Crea il nuovo preferito
      const [newFavorite] = await db
        .insert(favorites)
        .values({
          userId,
          propertyId
        })
        .returning();
      
      res.status(201).json(newFavorite);
    } catch (error: any) {
      console.error("Errore nell'aggiunta ai preferiti:", error);
      res.status(500).json({ 
        error: "SERVER_ERROR", 
        message: error.message || "Si è verificato un errore nell'aggiunta ai preferiti" 
      });
    }
  });
  
  // Rimuovi un preferito
  app.delete("/api/favorites/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        error: "UNAUTHORIZED", 
        message: "È necessario effettuare l'accesso per rimuovere dai preferiti" 
      });
    }
    
    try {
      const favoriteId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(favoriteId)) {
        return res.status(400).json({
          error: "BAD_REQUEST",
          message: "ID preferito non valido"
        });
      }
      
      // Verifica che il preferito esista e appartenga all'utente
      const existingFavorite = await db
        .select()
        .from(favorites)
        .where(
          and(
            eq(favorites.id, favoriteId),
            eq(favorites.userId, userId)
          )
        );
      
      if (existingFavorite.length === 0) {
        return res.status(404).json({
          error: "NOT_FOUND",
          message: "Preferito non trovato o non autorizzato"
        });
      }
      
      // Elimina il preferito
      await db
        .delete(favorites)
        .where(eq(favorites.id, favoriteId));
      
      res.status(204).send();
    } catch (error: any) {
      console.error("Errore nella rimozione dai preferiti:", error);
      res.status(500).json({ 
        error: "SERVER_ERROR", 
        message: error.message || "Si è verificato un errore nella rimozione dai preferiti" 
      });
    }
  });

  return httpServer;
}
