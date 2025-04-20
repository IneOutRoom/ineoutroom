const request = require('supertest');
const { pool } = require('../../server/db');
const { db } = require('../../server/db');
const { users, properties, reviews } = require('../../shared/schema');
const { eq, and } = require('drizzle-orm');

// Import l'app di express dal setup file
let app;

// Utente e proprietà di test
let testUserId;
let testOwnerId;
let testPropertyId;
let testReviewId;
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
    
    // Crea utente proprietario
    const ownerUser = {
      username: 'reviewsowner',
      email: 'reviewsowner@example.com',
      password: await hashPassword('OwnerPassword123'),
      name: 'Reviews Owner',
      role: 'user'
    };
    
    const [owner] = await db.insert(users).values(ownerUser).returning();
    testOwnerId = owner.id;
    
    // Crea utente recensore
    const reviewerUser = {
      username: 'reviewer',
      email: 'reviewer@example.com',
      password: await hashPassword('ReviewerPassword123'),
      name: 'The Reviewer',
      role: 'user'
    };
    
    const [reviewer] = await db.insert(users).values(reviewerUser).returning();
    testUserId = reviewer.id;
    
    // Login con l'utente recensore
    await agent.post('/api/login').send({
      username: 'reviewer',
      password: 'ReviewerPassword123'
    });
    
    // Crea una proprietà di test
    const testProperty = {
      title: 'Proprietà per Recensioni',
      description: 'Proprietà utilizzata per i test delle recensioni',
      price: 700,
      type: 'apartment',
      bedrooms: 2,
      bathrooms: 1,
      size: 75,
      cityId: 1, // Assicurati che esista nel tuo DB
      address: 'Via Recensioni 123',
      latitude: 45.4642,
      longitude: 9.1900,
      ownerId: testOwnerId,
      status: 'active'
    };
    
    const [property] = await db.insert(properties).values(testProperty).returning();
    testPropertyId = property.id;
    
  } catch (error) {
    console.error('Errore durante la configurazione dei test:', error);
  }
});

// Cleanup dopo tutti i test
afterAll(async () => {
  try {
    // Elimina le recensioni di test
    await db.delete(reviews).where(eq(reviews.propertyId, testPropertyId));
    // Elimina la proprietà di test
    await db.delete(properties).where(eq(properties.id, testPropertyId));
    // Elimina gli utenti di test
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(users).where(eq(users.id, testOwnerId));
  } catch (error) {
    console.error('Errore durante il cleanup:', error);
  }
  
  await pool.end();
});

describe('API delle Recensioni', () => {
  describe('POST /api/reviews', () => {
    it('dovrebbe creare una nuova recensione se l\'utente è autenticato', async () => {
      const newReview = {
        propertyId: testPropertyId,
        rating: 4,
        comment: 'Ottima proprietà, confortevole e ben posizionata',
        pros: 'Spazioso, pulito, vicino ai trasporti',
        cons: 'Un po\' rumoroso di notte'
      };
      
      const response = await agent
        .post('/api/reviews')
        .send(newReview)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.propertyId).toBe(testPropertyId);
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.rating).toBe(4);
      
      // Salva l'ID della recensione per i test successivi
      testReviewId = response.body.id;
    });
    
    it('dovrebbe impedire a un utente di lasciare più recensioni per la stessa proprietà', async () => {
      const duplicateReview = {
        propertyId: testPropertyId,
        rating: 5,
        comment: 'Tentativo di recensione duplicata',
        pros: 'Non dovrebbe essere accettato',
        cons: 'Perché è un duplicato'
      };
      
      const response = await agent
        .post('/api/reviews')
        .send(duplicateReview)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('già recensito');
    });
    
    it('dovrebbe fallire se l\'utente non è autenticato', async () => {
      const unauthenticatedReview = {
        propertyId: testPropertyId,
        rating: 3,
        comment: 'Questa recensione non dovrebbe essere creata',
        pros: 'Nessuno',
        cons: 'Utente non autenticato'
      };
      
      const unauthenticatedResponse = await request(app) // non usando l'agent autenticato
        .post('/api/reviews')
        .send(unauthenticatedReview)
        .set('Accept', 'application/json');
      
      expect(unauthenticatedResponse.status).toBe(401);
    });
  });
  
  describe('GET /api/properties/:id/reviews', () => {
    it('dovrebbe recuperare tutte le recensioni per una proprietà', async () => {
      const response = await request(app)
        .get(`/api/properties/${testPropertyId}/reviews`)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verifica che la recensione creata sia inclusa
      const createdReview = response.body.find(r => r.id === testReviewId);
      expect(createdReview).toBeDefined();
      expect(createdReview.propertyId).toBe(testPropertyId);
      expect(createdReview.rating).toBe(4);
    });
  });
  
  describe('PATCH /api/reviews/:id', () => {
    it('dovrebbe aggiornare una recensione esistente se l\'utente è l\'autore', async () => {
      const updatedData = {
        rating: 5,
        comment: 'Recensione aggiornata, ancora meglio di quanto pensassi',
        pros: 'Spazioso, pulito, vicino ai trasporti, ottimo arredamento',
        cons: 'Nessuno'
      };
      
      const response = await agent
        .patch(`/api/reviews/${testReviewId}`)
        .send(updatedData)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testReviewId);
      expect(response.body.rating).toBe(5);
      expect(response.body.comment).toBe(updatedData.comment);
    });
    
    it('dovrebbe fallire se l\'utente non è l\'autore della recensione', async () => {
      // Crea un altro utente e agent
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
        username: 'otherreviewer',
        email: 'other@example.com',
        password: await hashPassword('OtherPassword123'),
        name: 'Other Reviewer',
        role: 'user'
      };
      
      const [otherUser] = await db.insert(users).values(anotherUser).returning();
      const otherUserId = otherUser.id;
      
      // Login con l'altro utente
      const otherAgent = request.agent(app);
      await otherAgent.post('/api/login').send({
        username: 'otherreviewer',
        password: 'OtherPassword123'
      });
      
      const unauthorizedUpdate = {
        rating: 2,
        comment: 'Tentativo non autorizzato di modifica recensione'
      };
      
      const response = await otherAgent
        .patch(`/api/reviews/${testReviewId}`)
        .send(unauthorizedUpdate)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(403);
      
      // Cleanup
      await db.delete(users).where(eq(users.id, otherUserId));
    });
  });
  
  describe('DELETE /api/reviews/:id', () => {
    it('dovrebbe eliminare una recensione se l\'utente è l\'autore', async () => {
      const response = await agent
        .delete(`/api/reviews/${testReviewId}`)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      
      // Verifica che la recensione sia stata effettivamente eliminata
      const getResponse = await request(app)
        .get(`/api/properties/${testPropertyId}/reviews`)
        .set('Accept', 'application/json');
      
      const deletedReview = getResponse.body.find(r => r.id === testReviewId);
      expect(deletedReview).toBeUndefined();
    });
  });
  
  describe('POST /api/reviews/:id/vote', () => {
    let newReviewId;
    
    // Crea una nuova recensione per i test di voto
    beforeAll(async () => {
      const newReview = {
        propertyId: testPropertyId,
        rating: 4,
        comment: 'Recensione per test di voto',
        pros: 'Bellissimo',
        cons: 'Nessuno'
      };
      
      const response = await agent
        .post('/api/reviews')
        .send(newReview)
        .set('Accept', 'application/json');
      
      newReviewId = response.body.id;
    });
    
    it('dovrebbe permettere a un utente di votare una recensione come utile', async () => {
      const vote = {
        isHelpful: true
      };
      
      const response = await agent
        .post(`/api/reviews/${newReviewId}/vote`)
        .send(vote)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(201);
      expect(response.body.reviewId).toBe(newReviewId);
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.isHelpful).toBe(true);
    });
    
    it('dovrebbe aggiornare un voto esistente se l\'utente cambia opinione', async () => {
      const updatedVote = {
        isHelpful: false
      };
      
      const response = await agent
        .post(`/api/reviews/${newReviewId}/vote`)
        .send(updatedVote)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body.reviewId).toBe(newReviewId);
      expect(response.body.isHelpful).toBe(false);
    });
    
    it('dovrebbe aggiornare i conteggi dei voti della recensione', async () => {
      // Crea un altro utente e vota
      const scrypt = require('crypto').scrypt;
      const randomBytes = require('crypto').randomBytes;
      const promisify = require('util').promisify;
      const scryptAsync = promisify(scrypt);
      
      const hashPassword = async (password) => {
        const salt = randomBytes(16).toString('hex');
        const buf = (await scryptAsync(password, salt, 64));
        return `${buf.toString('hex')}.${salt}`;
      };
      
      const voterUser = {
        username: 'voter',
        email: 'voter@example.com',
        password: await hashPassword('VoterPassword123'),
        name: 'Voter User',
        role: 'user'
      };
      
      const [voter] = await db.insert(users).values(voterUser).returning();
      const voterId = voter.id;
      
      // Login con l'utente votante
      const voterAgent = request.agent(app);
      await voterAgent.post('/api/login').send({
        username: 'voter',
        password: 'VoterPassword123'
      });
      
      // Vota la recensione come utile
      await voterAgent
        .post(`/api/reviews/${newReviewId}/vote`)
        .send({ isHelpful: true })
        .set('Accept', 'application/json');
      
      // Controlla i dettagli della recensione
      const reviewResponse = await request(app)
        .get(`/api/properties/${testPropertyId}/reviews`)
        .set('Accept', 'application/json');
      
      const updatedReview = reviewResponse.body.find(r => r.id === newReviewId);
      expect(updatedReview).toBeDefined();
      expect(updatedReview.helpful).toBe(1); // 1 voto utile
      expect(updatedReview.unhelpful).toBe(1); // 1 voto non utile
      
      // Cleanup
      await db.delete(users).where(eq(users.id, voterId));
    });
  });
  
  describe('POST /api/reviews/:id/report', () => {
    it('dovrebbe permettere a un utente di segnalare una recensione inappropriata', async () => {
      const report = {
        reason: 'offensive',
        details: 'Questa recensione contiene linguaggio offensivo'
      };
      
      const response = await agent
        .post(`/api/reviews/${newReviewId}/report`)
        .send(report)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(201);
      expect(response.body.reviewId).toBe(newReviewId);
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.reason).toBe('offensive');
      expect(response.body.status).toBe('pending');
    });
    
    it('dovrebbe impedire report duplicati dalla stessa persona', async () => {
      const duplicateReport = {
        reason: 'fake',
        details: 'Questa recensione contiene informazioni false'
      };
      
      const response = await agent
        .post(`/api/reviews/${newReviewId}/report`)
        .send(duplicateReport)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('già segnalato');
    });
  });
});