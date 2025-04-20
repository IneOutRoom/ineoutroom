// Mock di Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      paymentIntents: {
        create: jest.fn().mockImplementation(async ({ amount, currency }) => {
          return {
            id: 'pi_test_123456',
            client_secret: 'pi_test_secret_123456',
            amount,
            currency,
            status: 'requires_payment_method'
          };
        }),
        retrieve: jest.fn().mockImplementation(async (id) => {
          return {
            id,
            client_secret: 'pi_test_secret_' + id,
            amount: 80000,
            currency: 'eur',
            status: 'succeeded'
          };
        })
      },
      customers: {
        create: jest.fn().mockImplementation(async ({ email, name }) => {
          return {
            id: 'cus_test_123456',
            email,
            name
          };
        }),
        retrieve: jest.fn().mockImplementation(async (id) => {
          return {
            id,
            email: 'test@example.com',
            name: 'Test Customer'
          };
        })
      },
      subscriptions: {
        create: jest.fn().mockImplementation(async ({ customer, items }) => {
          return {
            id: 'sub_test_123456',
            customer,
            items: {
              data: items.map(item => ({
                id: 'si_test_' + item.price,
                price: item.price,
                quantity: 1
              }))
            },
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime() / 1000,
            latest_invoice: {
              payment_intent: {
                client_secret: 'pi_test_secret_sub_123456'
              }
            }
          };
        }),
        retrieve: jest.fn().mockImplementation(async (id) => {
          return {
            id,
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime() / 1000
          };
        }),
        update: jest.fn().mockImplementation(async (id, { cancel_at_period_end }) => {
          return {
            id,
            status: 'active',
            cancel_at_period_end
          };
        })
      }
    };
  });
});

const request = require('supertest');

// Mock dell'app Express
const express = require('express');
const bodyParser = require('body-parser');

// Mock delle sessions
const sessions = {};

// Crea sessione mock
const createMockApp = () => {
  const app = express();
  app.use(bodyParser.json());
  
  // Mock della sessione
  app.use((req, res, next) => {
    const sessionId = req.headers['session-id'] || 'default-session';
    req.session = sessions[sessionId] || {};
    req.isAuthenticated = () => !!req.session.user;
    req.user = req.session.user;
    req.login = (user, callback) => {
      req.session.user = user;
      sessions[sessionId] = req.session;
      callback(null);
    };
    next();
  });
  
  return app;
};

describe('Integrazione Stripe', () => {
  let app;
  let stripeRoutes;
  let Stripe;
  
  beforeAll(() => {
    // Imposta environment variables
    process.env.STRIPE_SECRET_KEY = 'test_stripe_secret_key';
    process.env.STRIPE_PRICE_ID = 'price_test_123456';
    
    // Import il modulo Stripe
    Stripe = require('stripe');
    
    // Crea app mock
    app = createMockApp();
    
    // Import il modulo di routes
    stripeRoutes = require('../../server/routes/stripeRoutes');
    
    // Registra le routes
    stripeRoutes.registerStripeRoutes(app);
  });
  
  beforeEach(() => {
    // Reset le sessioni
    Object.keys(sessions).forEach(key => delete sessions[key]);
    
    // Reset i mock
    jest.clearAllMocks();
  });

  describe('POST /api/create-payment-intent', () => {
    it('dovrebbe creare un payment intent per un pagamento una tantum', async () => {
      // Crea un utente autenticato nella sessione
      const sessionId = 'test-session-1';
      sessions[sessionId] = {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        }
      };
      
      const response = await request(app)
        .post('/api/create-payment-intent')
        .set('Session-ID', sessionId)
        .send({
          amount: 800,
          currency: 'eur',
          propertyId: 1
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('clientSecret');
      expect(response.body.clientSecret).toBe('pi_test_secret_123456');
      
      // Verifica che Stripe sia stato chiamato correttamente
      expect(Stripe).toHaveBeenCalledWith('test_stripe_secret_key', expect.any(Object));
      expect(Stripe().paymentIntents.create).toHaveBeenCalledWith({
        amount: 80000, // in centesimi
        currency: 'eur',
        metadata: {
          propertyId: 1,
          userId: 1
        }
      });
    });
    
    it('dovrebbe fallire per utenti non autenticati', async () => {
      const response = await request(app)
        .post('/api/create-payment-intent')
        .send({
          amount: 800,
          currency: 'eur',
          propertyId: 1
        });
      
      expect(response.status).toBe(401);
      expect(Stripe().paymentIntents.create).not.toHaveBeenCalled();
    });
  });
  
  describe('POST /api/get-or-create-subscription', () => {
    it('dovrebbe creare un nuovo abbonamento per un utente senza abbonamento attivo', async () => {
      // Crea un utente autenticato nella sessione
      const sessionId = 'test-session-2';
      sessions[sessionId] = {
        user: {
          id: 2,
          username: 'subuser',
          email: 'sub@example.com',
          stripeCustomerId: null,
          stripeSubscriptionId: null
        }
      };
      
      const response = await request(app)
        .post('/api/get-or-create-subscription')
        .set('Session-ID', sessionId)
        .send({
          plan: 'premium'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('subscriptionId', 'sub_test_123456');
      expect(response.body).toHaveProperty('clientSecret', 'pi_test_secret_sub_123456');
      
      // Verifica che Stripe sia stato chiamato correttamente
      expect(Stripe().customers.create).toHaveBeenCalledWith({
        email: 'sub@example.com',
        name: 'subuser'
      });
      
      expect(Stripe().subscriptions.create).toHaveBeenCalledWith({
        customer: 'cus_test_123456',
        items: [{ price: 'price_test_123456' }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });
    });
    
    it('dovrebbe recuperare un abbonamento esistente', async () => {
      // Crea un utente autenticato con abbonamento esistente
      const sessionId = 'test-session-3';
      sessions[sessionId] = {
        user: {
          id: 3,
          username: 'existingsubuser',
          email: 'existingsub@example.com',
          stripeCustomerId: 'cus_existing_123456',
          stripeSubscriptionId: 'sub_existing_123456'
        }
      };
      
      const response = await request(app)
        .post('/api/get-or-create-subscription')
        .set('Session-ID', sessionId)
        .send({
          plan: 'premium'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('subscriptionId', 'sub_existing_123456');
      
      // Verifica che Stripe sia stato chiamato correttamente
      expect(Stripe().subscriptions.retrieve).toHaveBeenCalledWith('sub_existing_123456');
      
      // Non dovrebbe creare un nuovo cliente o abbonamento
      expect(Stripe().customers.create).not.toHaveBeenCalled();
      expect(Stripe().subscriptions.create).not.toHaveBeenCalled();
    });
  });
  
  describe('POST /api/cancel-subscription', () => {
    it('dovrebbe cancellare un abbonamento', async () => {
      // Crea un utente autenticato con abbonamento esistente
      const sessionId = 'test-session-4';
      sessions[sessionId] = {
        user: {
          id: 4,
          username: 'canceluser',
          email: 'cancel@example.com',
          stripeCustomerId: 'cus_cancel_123456',
          stripeSubscriptionId: 'sub_cancel_123456'
        }
      };
      
      const response = await request(app)
        .post('/api/cancel-subscription')
        .set('Session-ID', sessionId)
        .send();
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verifica che Stripe sia stato chiamato correttamente
      expect(Stripe().subscriptions.update).toHaveBeenCalledWith('sub_cancel_123456', {
        cancel_at_period_end: true
      });
    });
    
    it('dovrebbe fallire se l\'utente non ha un abbonamento', async () => {
      // Crea un utente autenticato senza abbonamento
      const sessionId = 'test-session-5';
      sessions[sessionId] = {
        user: {
          id: 5,
          username: 'nosubuser',
          email: 'nosub@example.com',
          stripeCustomerId: 'cus_nosub_123456',
          stripeSubscriptionId: null
        }
      };
      
      const response = await request(app)
        .post('/api/cancel-subscription')
        .set('Session-ID', sessionId)
        .send();
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      
      // Non dovrebbe chiamare Stripe
      expect(Stripe().subscriptions.update).not.toHaveBeenCalled();
    });
  });
  
  describe('POST /api/webhook', () => {
    it('dovrebbe gestire un webhook di pagamento avvenuto con successo', async () => {
      // Mock della funzione per verificare la signature del webhook
      const constructEvent = jest.fn().mockImplementation(() => ({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_webhook_123456',
            metadata: {
              propertyId: '1',
              userId: '1'
            },
            amount: 80000,
            currency: 'eur',
            status: 'succeeded'
          }
        }
      }));
      
      // Sovrascrive la funzione per questo test
      Stripe.webhooks = { constructEvent };
      
      const response = await request(app)
        .post('/api/webhook')
        .set('Stripe-Signature', 'test_signature')
        .send(JSON.stringify({
          id: 'evt_test_123456',
          type: 'payment_intent.succeeded'
        }));
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('received', true);
    });
    
    it('dovrebbe gestire un webhook di abbonamento aggiornato', async () => {
      // Mock della funzione per verificare la signature del webhook
      const constructEvent = jest.fn().mockImplementation(() => ({
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_webhook_123456',
            customer: 'cus_webhook_123456',
            status: 'active',
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
          }
        }
      }));
      
      // Sovrascrive la funzione per questo test
      Stripe.webhooks = { constructEvent };
      
      const response = await request(app)
        .post('/api/webhook')
        .set('Stripe-Signature', 'test_signature')
        .send(JSON.stringify({
          id: 'evt_test_123456',
          type: 'customer.subscription.updated'
        }));
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('received', true);
    });
  });
});