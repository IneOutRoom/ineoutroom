const request = require('supertest');
const { pool } = require('../../server/db');
const { db } = require('../../server/db');
const { users, properties } = require('../../shared/schema');
const { eq } = require('drizzle-orm');

// Import l'app di express dal setup file
let app;

// Utente di test per autenticazione
let testUserId;
let agent;

beforeAll(async () => {
  app = global.app;
  agent = request.agent(app);
  
  // Crea un utente di test
  try {
    // Hashare la password come in produzione
    const scrypt = require('crypto').scrypt;
    const randomBytes = require('crypto').randomBytes;
    const promisify = require('util').promisify;
    const scryptAsync = promisify(scrypt);
    
    const hashPassword = async (password) => {
      const salt = randomBytes(16).toString('hex');
      const buf = (await scryptAsync(password, salt, 64));
      return `${buf.toString('hex')}.${salt}`;
    };
    
    // Crea l'utente
    const testUser = {
      username: 'propertyowner',
      email: 'owner@example.com',
      password: await hashPassword('OwnerPassword123'),
      name: 'Property Owner',
      role: 'user'
    };
    
    // Inserisci l'utente e ottieni l'ID
    const [user] = await db.insert(users).values(testUser).returning();
    testUserId = user.id;
    
    // Login con l'utente
    await agent.post('/api/login').send({
      username: 'propertyowner',
      password: 'OwnerPassword123'
    });
    
    // Crea alcune proprietà di test
    const testProperties = [
      {
        title: 'Appartamento Test 1',
        description: 'Bellissimo appartamento per test',
        price: 800,
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        size: 80,
        cityId: 1, // Assicurati che esista nel tuo DB
        address: 'Via di Test 123',
        latitude: 45.4642,
        longitude: 9.1900,
        ownerId: testUserId,
        status: 'active'
      },
      {
        title: 'Stanza Test 1',
        description: 'Stanza singola in appartamento condiviso',
        price: 350,
        type: 'room',
        bedrooms: 1,
        bathrooms: 1,
        size: 20,
        cityId: 1, // Assicurati che esista nel tuo DB
        address: 'Via di Test 456',
        latitude: 45.4742,
        longitude: 9.1800,
        ownerId: testUserId,
        status: 'active'
      }
    ];
    
    for (const property of testProperties) {
      await db.insert(properties).values(property);
    }
    
  } catch (error) {
    console.error('Errore durante la configurazione dei test:', error);
  }
});

// Cleanup dopo tutti i test
afterAll(async () => {
  // Elimina le proprietà di test
  try {
    await db.delete(properties).where(eq(properties.ownerId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
  } catch (error) {
    console.error('Errore durante il cleanup:', error);
  }
  
  await pool.end();
});

describe('API delle Proprietà', () => {
  describe('GET /api/properties', () => {
    it('dovrebbe recuperare l\'elenco delle proprietà', async () => {
      const response = await request(app)
        .get('/api/properties')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
    
    it('dovrebbe filtrare le proprietà per città', async () => {
      const response = await request(app)
        .get('/api/properties?cityId=1')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Tutte le proprietà restituite dovrebbero avere cityId=1
      response.body.forEach(property => {
        expect(property.cityId).toBe(1);
      });
    });
    
    it('dovrebbe filtrare le proprietà per tipo', async () => {
      const response = await request(app)
        .get('/api/properties?type=apartment')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Tutte le proprietà restituite dovrebbero essere di tipo apartment
      response.body.forEach(property => {
        expect(property.type).toBe('apartment');
      });
    });
    
    it('dovrebbe filtrare le proprietà per prezzo massimo', async () => {
      const maxPrice = 500;
      const response = await request(app)
        .get(`/api/properties?maxPrice=${maxPrice}`)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Tutte le proprietà restituite dovrebbero avere prezzo <= maxPrice
      response.body.forEach(property => {
        expect(property.price).toBeLessThanOrEqual(maxPrice);
      });
    });
  });
  
  describe('GET /api/properties/:id', () => {
    let testPropertyId;
    
    beforeAll(async () => {
      // Ottieni l'ID di una proprietà esistente
      const [property] = await db
        .select()
        .from(properties)
        .where(eq(properties.ownerId, testUserId))
        .limit(1);
        
      testPropertyId = property.id;
    });
    
    it('dovrebbe recuperare i dettagli di una proprietà specifica', async () => {
      const response = await request(app)
        .get(`/api/properties/${testPropertyId}`)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testPropertyId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('price');
    });
    
    it('dovrebbe ritornare 404 per una proprietà inesistente', async () => {
      const response = await request(app)
        .get('/api/properties/9999')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('POST /api/properties', () => {
    it('dovrebbe creare una nuova proprietà se l\'utente è autenticato', async () => {
      const newProperty = {
        title: 'Nuova Proprietà Test',
        description: 'Descrizione della nuova proprietà di test',
        price: 600,
        type: 'apartment',
        bedrooms: 1,
        bathrooms: 1,
        size: 50,
        cityId: 1, // Assicurati che esista nel tuo DB
        address: 'Via Nuova Test 789',
        latitude: 45.4842,
        longitude: 9.1700,
        status: 'active'
      };
      
      const response = await agent
        .post('/api/properties')
        .send(newProperty)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newProperty.title);
      expect(response.body.ownerId).toBe(testUserId);
    });
    
    it('dovrebbe fallire se l\'utente non è autenticato', async () => {
      const newProperty = {
        title: 'Proprietà senza autorizzazione',
        description: 'Questa proprietà non dovrebbe essere creata',
        price: 700,
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        size: 70,
        cityId: 1,
        address: 'Via Senza Auth 123',
        latitude: 45.4942,
        longitude: 9.1600,
        status: 'active'
      };
      
      const response = await request(app) // non usando l'agent autenticato
        .post('/api/properties')
        .send(newProperty)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('PATCH /api/properties/:id', () => {
    let testPropertyId;
    
    beforeAll(async () => {
      // Ottieni l'ID di una proprietà esistente dell'utente di test
      const [property] = await db
        .select()
        .from(properties)
        .where(eq(properties.ownerId, testUserId))
        .limit(1);
        
      testPropertyId = property.id;
    });
    
    it('dovrebbe aggiornare una proprietà esistente se l\'utente è il proprietario', async () => {
      const updatedData = {
        title: 'Titolo Aggiornato',
        price: 850
      };
      
      const response = await agent
        .patch(`/api/properties/${testPropertyId}`)
        .send(updatedData)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testPropertyId);
      expect(response.body.title).toBe(updatedData.title);
      expect(response.body.price).toBe(updatedData.price);
    });
    
    it('dovrebbe fallire se l\'utente non è autenticato', async () => {
      const updatedData = {
        title: 'Titolo Non Autorizzato',
        price: 900
      };
      
      const response = await request(app) // non usando l'agent autenticato
        .patch(`/api/properties/${testPropertyId}`)
        .send(updatedData)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(401);
    });
    
    it('dovrebbe fallire se l\'utente non è il proprietario', async () => {
      // Crea un altro utente
      const scrypt = require('crypto').scrypt;
      const randomBytes = require('crypto').randomBytes;
      const promisify = require('util').promisify;
      const scryptAsync = promisify(scrypt);
      
      const hashPassword = async (password) => {
        const salt = randomBytes(16).toString('hex');
        const buf = (await scryptAsync(password, salt, 64));
        return `${buf.toString('hex')}.${salt}`;
      };
      
      const anotherUser = {
        username: 'anotheruser',
        email: 'another@example.com',
        password: await hashPassword('AnotherPassword123'),
        name: 'Another User',
        role: 'user'
      };
      
      const [user] = await db.insert(users).values(anotherUser).returning();
      const anotherUserId = user.id;
      
      // Login con l'altro utente
      const anotherAgent = request.agent(app);
      await anotherAgent.post('/api/login').send({
        username: 'anotheruser',
        password: 'AnotherPassword123'
      });
      
      const updatedData = {
        title: 'Titolo da Altro Utente',
        price: 950
      };
      
      const response = await anotherAgent
        .patch(`/api/properties/${testPropertyId}`)
        .send(updatedData)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(403);
      
      // Cleanup
      await db.delete(users).where(eq(users.id, anotherUserId));
    });
  });
  
  describe('DELETE /api/properties/:id', () => {
    let testPropertyIdToDelete;
    
    beforeAll(async () => {
      // Crea una proprietà specifica per il test di eliminazione
      const newProperty = {
        title: 'Proprietà da Eliminare',
        description: 'Questa proprietà sarà eliminata durante il test',
        price: 500,
        type: 'room',
        bedrooms: 1,
        bathrooms: 1,
        size: 25,
        cityId: 1,
        address: 'Via da Eliminare 123',
        latitude: 45.5042,
        longitude: 9.1500,
        ownerId: testUserId,
        status: 'active'
      };
      
      const [property] = await db.insert(properties).values(newProperty).returning();
      testPropertyIdToDelete = property.id;
    });
    
    it('dovrebbe eliminare una proprietà se l\'utente è il proprietario', async () => {
      const response = await agent
        .delete(`/api/properties/${testPropertyIdToDelete}`)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      
      // Verifica che la proprietà sia stata effettivamente eliminata
      const [deletedProperty] = await db
        .select()
        .from(properties)
        .where(eq(properties.id, testPropertyIdToDelete));
      
      expect(deletedProperty).toBeUndefined();
    });
    
    it('dovrebbe fallire se si tenta di eliminare una proprietà inesistente', async () => {
      const response = await agent
        .delete(`/api/properties/${testPropertyIdToDelete}`) // proprietà già eliminata
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(404);
    });
  });
});