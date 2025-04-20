const request = require('supertest');
const { pool } = require('../../server/db');
const { db } = require('../../server/db');
const { users, properties, userInteractions } = require('../../shared/schema');
const { eq } = require('drizzle-orm');

// Import l'app di express dal setup file
let app;

// Utente e proprietà di test
let testUserId;
let testPropertyId;
let agent;

beforeAll(async () => {
  app = global.app;
  agent = request.agent(app);
  
  try {
    // Hash della password per test
    const scrypt = require('crypto').scrypt;
    const randomBytes = require('crypto').randomBytes;
    const promisify = require('util').promisify;
    const scryptAsync = promisify(scrypt);
    
    const hashPassword = async (password) => {
      const salt = randomBytes(16).toString('hex');
      const buf = (await scryptAsync(password, salt, 64));
      return `${buf.toString('hex')}.${salt}`;
    };
    
    // Crea utente di test
    const testUser = {
      username: 'recommuser',
      email: 'recommuser@example.com',
      password: await hashPassword('RecommPassword123'),
      name: 'Recomm User',
      role: 'user'
    };
    
    const [user] = await db.insert(users).values(testUser).returning();
    testUserId = user.id;
    
    // Login con l'utente
    await agent.post('/api/login').send({
      username: 'recommuser',
      password: 'RecommPassword123'
    });
    
    // Crea alcune proprietà di test
    const testProperties = [
      {
        title: 'Appartamento Test Raccomandazioni 1',
        description: 'Bellissimo appartamento per test di raccomandazione',
        price: 800,
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        size: 80,
        cityId: 1, // Assicurati che esista nel tuo DB
        address: 'Via Raccomandazioni 123',
        latitude: 45.4642,
        longitude: 9.1900,
        ownerId: testUserId,
        status: 'active'
      },
      {
        title: 'Appartamento Test Raccomandazioni 2',
        description: 'Secondo appartamento per test di raccomandazione',
        price: 750,
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        size: 75,
        cityId: 1, // Assicurati che esista nel tuo DB
        address: 'Via Raccomandazioni 456',
        latitude: 45.4742,
        longitude: 9.1800,
        ownerId: testUserId,
        status: 'active'
      },
      {
        title: 'Stanza Test Raccomandazioni',
        description: 'Stanza singola per test di raccomandazione',
        price: 400,
        type: 'room',
        bedrooms: 1,
        bathrooms: 1,
        size: 20,
        cityId: 1, // Assicurati che esista nel tuo DB
        address: 'Via Raccomandazioni 789',
        latitude: 45.4842,
        longitude: 9.1700,
        ownerId: testUserId,
        status: 'active'
      }
    ];
    
    // Inserisci proprietà e salva l'ID della prima
    const [property] = await db.insert(properties).values(testProperties[0]).returning();
    testPropertyId = property.id;
    
    // Inserisci le altre proprietà
    await db.insert(properties).values([testProperties[1], testProperties[2]]);
    
    // Crea alcune interazioni utente per alimentare il motore di raccomandazione
    const testInteractions = [
      {
        userId: testUserId,
        propertyId: testPropertyId,
        type: 'view',
        count: 5
      },
      {
        userId: testUserId,
        propertyId: testPropertyId,
        type: 'favorite',
        count: 1
      }
    ];
    
    for (const interaction of testInteractions) {
      await db.insert(userInteractions).values(interaction);
    }
    
  } catch (error) {
    console.error('Errore durante la configurazione dei test:', error);
  }
});

// Cleanup dopo tutti i test
afterAll(async () => {
  try {
    // Elimina le interazioni utente di test
    await db.delete(userInteractions).where(eq(userInteractions.userId, testUserId));
    
    // Elimina le proprietà di test
    await db.delete(properties).where(eq(properties.ownerId, testUserId));
    
    // Elimina l'utente di test
    await db.delete(users).where(eq(users.id, testUserId));
  } catch (error) {
    console.error('Errore durante il cleanup:', error);
  }
  
  await pool.end();
});

describe('API di Raccomandazione', () => {
  describe('GET /api/recommendations', () => {
    it('dovrebbe restituire proprietà raccomandate per l\'utente autenticato', async () => {
      const response = await agent
        .get('/api/recommendations')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verifica che ogni proprietà raccomandata abbia tutti i campi necessari
      response.body.forEach(property => {
        expect(property).toHaveProperty('id');
        expect(property).toHaveProperty('title');
        expect(property).toHaveProperty('price');
        expect(property).toHaveProperty('type');
      });
    });
    
    it('dovrebbe fallire per utenti non autenticati', async () => {
      const response = await request(app) // non usando l'agent autenticato
        .get('/api/recommendations')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/properties/:id/similar', () => {
    it('dovrebbe restituire proprietà simili a una specifica', async () => {
      const response = await request(app)
        .get(`/api/properties/${testPropertyId}/similar`)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verifica che le proprietà simili non includano quella di riferimento
      const propertyIds = response.body.map(p => p.id);
      expect(propertyIds).not.toContain(testPropertyId);
      
      // Verifica che le proprietà simili abbiano campi simili all'originale
      const firstSimilar = response.body[0];
      // Se il sistema di raccomandazione funziona correttamente, il primo risultato
      // dovrebbe essere un appartamento simile
      expect(firstSimilar.type).toBe('apartment');
    });
    
    it('dovrebbe ritornare 404 per una proprietà inesistente', async () => {
      const response = await request(app)
        .get('/api/properties/99999/similar')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('POST /api/interactions', () => {
    it('dovrebbe registrare una nuova interazione utente', async () => {
      const newInteraction = {
        propertyId: testPropertyId,
        type: 'message',
        count: 1
      };
      
      const response = await agent
        .post('/api/interactions')
        .send(newInteraction)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.propertyId).toBe(testPropertyId);
      expect(response.body.type).toBe('message');
    });
    
    it('dovrebbe aggiornare un\'interazione esistente', async () => {
      const updateInteraction = {
        propertyId: testPropertyId,
        type: 'view', // Questa interazione dovrebbe già esistere
        count: 1 // Incrementerà il conteggio esistente
      };
      
      const response = await agent
        .post('/api/interactions')
        .send(updateInteraction)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.count).toBeGreaterThan(5); // Il conteggio originale era 5
    });
    
    it('dovrebbe fallire per utenti non autenticati', async () => {
      const newInteraction = {
        propertyId: testPropertyId,
        type: 'favorite',
        count: 1
      };
      
      const response = await request(app) // non usando l'agent autenticato
        .post('/api/interactions')
        .send(newInteraction)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(401);
    });
  });
});