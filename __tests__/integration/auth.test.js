const request = require('supertest');
const { pool } = require('../../server/db');
const { db } = require('../../server/db');
const { users, cities } = require('../../shared/schema');
const { eq } = require('drizzle-orm');

// Import l'app di express dal setup file
let app;

beforeAll(() => {
  app = global.app;
});

// Cleanup dopo ogni test
afterEach(async () => {
  try {
    // Elimina utenti di test creati - NON usare in produzione!
    // Questo è sicuro solo perché è in un ambiente di test
    await db.delete(users).where(eq(users.username, 'testuser'));
    await db.delete(users).where(eq(users.username, 'existinguser'));
  } catch (error) {
    console.error('Errore durante il cleanup:', error);
  }
});

// Cleanup dopo tutti i test
afterAll(async () => {
  await pool.end();
});

describe('API di Autenticazione', () => {
  // Test per la registrazione
  describe('POST /api/register', () => {
    // Prima di questo test, creiamo un utente esistente per testare il caso di username duplicato
    beforeAll(async () => {
      try {
        const existingUser = {
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123', // In un'app reale questo sarebbe hashato
          name: 'Existing User',
          role: 'user'
        };
        
        await db.insert(users).values(existingUser);
      } catch (error) {
        console.error('Errore durante la creazione dell\'utente esistente:', error);
      }
    });
    
    it('dovrebbe registrare un nuovo utente con successo', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123',
        name: 'Test User',
        role: 'user'
      };
      
      const response = await request(app)
        .post('/api/register')
        .send(newUser)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(newUser.username);
      expect(response.body.email).toBe(newUser.email);
      expect(response.body).not.toHaveProperty('password'); // La password non dovrebbe essere restituita
    });
    
    it('dovrebbe fallire se l\'username esiste già', async () => {
      const duplicateUser = {
        username: 'existinguser',
        email: 'another@example.com',
        password: 'AnotherPassword123',
        name: 'Another User',
        role: 'user'
      };
      
      const response = await request(app)
        .post('/api/register')
        .send(duplicateUser)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(400);
    });
    
    it('dovrebbe fallire se mancano campi obbligatori', async () => {
      const incompleteUser = {
        username: 'incompleteuser',
        // Manca email
        password: 'IncompletePassword123'
      };
      
      const response = await request(app)
        .post('/api/register')
        .send(incompleteUser)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(400);
    });
  });
  
  // Test per il login
  describe('POST /api/login', () => {
    // Prima di ogni test di login, creiamo un utente
    beforeEach(async () => {
      try {
        // Utilizziamo un utente con password hashata come in produzione
        const scrypt = require('crypto').scrypt;
        const randomBytes = require('crypto').randomBytes;
        const promisify = require('util').promisify;
        const scryptAsync = promisify(scrypt);
        
        const hashPassword = async (password) => {
          const salt = randomBytes(16).toString('hex');
          const buf = (await scryptAsync(password, salt, 64));
          return `${buf.toString('hex')}.${salt}`;
        };
        
        const testUser = {
          username: 'testuser',
          email: 'test@example.com',
          password: await hashPassword('TestPassword123'),
          name: 'Test User',
          role: 'user'
        };
        
        await db.insert(users).values(testUser);
      } catch (error) {
        console.error('Errore durante la creazione dell\'utente di test:', error);
      }
    });
    
    it('dovrebbe effettuare il login con successo con credenziali corrette', async () => {
      const loginCredentials = {
        username: 'testuser',
        password: 'TestPassword123'
      };
      
      const response = await request(app)
        .post('/api/login')
        .send(loginCredentials)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(loginCredentials.username);
    });
    
    it('dovrebbe fallire con credenziali errate', async () => {
      const wrongCredentials = {
        username: 'testuser',
        password: 'WrongPassword123'
      };
      
      const response = await request(app)
        .post('/api/login')
        .send(wrongCredentials)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(401);
    });
  });
  
  // Test per il logout
  describe('POST /api/logout', () => {
    it('dovrebbe effettuare il logout con successo', async () => {
      // Prima facciamo login per avere una sessione
      const loginCredentials = {
        username: 'testuser',
        password: 'TestPassword123'
      };
      
      const agent = request.agent(app);
      
      // Login
      await agent
        .post('/api/login')
        .send(loginCredentials)
        .set('Accept', 'application/json');
      
      // Logout
      const response = await agent
        .post('/api/logout')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
    });
  });
  
  // Test per il recupero delle informazioni utente
  describe('GET /api/user', () => {
    it('dovrebbe recuperare le informazioni utente se autenticato', async () => {
      // Prima facciamo login per avere una sessione
      const loginCredentials = {
        username: 'testuser',
        password: 'TestPassword123'
      };
      
      const agent = request.agent(app);
      
      // Login
      await agent
        .post('/api/login')
        .send(loginCredentials)
        .set('Accept', 'application/json');
      
      // Ottieni informazioni utente
      const response = await agent
        .get('/api/user')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(loginCredentials.username);
    });
    
    it('dovrebbe ritornare 401 se non autenticato', async () => {
      const response = await request(app)
        .get('/api/user')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(401);
    });
  });
});