// Test end-to-end per l'autenticazione

describe('Autenticazione', () => {
  beforeEach(() => {
    // Visita la pagina di autenticazione prima di ogni test
    cy.visit('/auth');
  });

  it('dovrebbe mostrare i form di accesso e registrazione', () => {
    // Verifica che ci siano sia il form di login che di registrazione
    cy.contains('Accedi').should('be.visible');
    cy.contains('Registrati').should('be.visible');
  });

  it('dovrebbe visualizzare errori di validazione per i campi mancanti', () => {
    // Prova a inviare il form di login vuoto
    cy.contains('Accedi').click();
    cy.get('form').first().within(() => {
      cy.get('button[type="submit"]').click();
    });

    // Dovrebbero apparire messaggi di errore
    cy.contains('Username richiesto').should('be.visible');
    cy.contains('Password richiesta').should('be.visible');

    // Prova a inviare il form di registrazione vuoto
    cy.contains('Registrati').click();
    cy.get('form').eq(1).within(() => {
      cy.get('button[type="submit"]').click();
    });

    // Dovrebbero apparire messaggi di errore
    cy.contains('Username richiesto').should('be.visible');
    cy.contains('Email richiesta').should('be.visible');
    cy.contains('Password richiesta').should('be.visible');
  });

  it('dovrebbe registrare un nuovo utente e reindirizzare alla home', () => {
    // Genera username casuale per evitare conflitti
    const username = `test_user_${Date.now()}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // Passa al form di registrazione
    cy.contains('Registrati').click();

    // Compila il form di registrazione
    cy.get('form').eq(1).within(() => {
      cy.get('input[name="username"]').type(username);
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('input[name="name"]').type('Test User');
      cy.get('button[type="submit"]').click();
    });

    // Dopo la registrazione, dovremmo essere reindirizzati alla home
    cy.url().should('not.include', '/auth');
    
    // Verifica che siamo autenticati
    cy.contains(username).should('be.visible');
  });

  it('dovrebbe effettuare il login e reindirizzare alla home', () => {
    // Assumi che esista già un utente testuser/testpassword
    const username = 'propertyowner';
    const password = 'OwnerPassword123';

    // Compila il form di login
    cy.get('form').first().within(() => {
      cy.get('input[name="username"]').type(username);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
    });

    // Dopo il login, dovremmo essere reindirizzati alla home
    cy.url().should('not.include', '/auth');
    
    // Verifica che siamo autenticati
    cy.contains(username).should('be.visible');
  });

  it('dovrebbe mostrare un errore per credenziali invalide', () => {
    const username = 'utente_inesistente';
    const password = 'PasswordSbagliata123!';

    // Compila il form di login con credenziali errate
    cy.get('form').first().within(() => {
      cy.get('input[name="username"]').type(username);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
    });

    // Dovrebbe apparire un messaggio di errore
    cy.contains('Credenziali non valide').should('be.visible');
    
    // Non dovremmo essere reindirizzati
    cy.url().should('include', '/auth');
  });

  it('dovrebbe effettuare il logout correttamente', () => {
    // Prima effettua il login
    const username = 'propertyowner';
    const password = 'OwnerPassword123';

    cy.get('form').first().within(() => {
      cy.get('input[name="username"]').type(username);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
    });

    // Verifica che siamo loggati
    cy.url().should('not.include', '/auth');
    
    // Ora effettua il logout
    cy.get('[data-testid="user-menu"]').click();
    cy.contains('Logout').click();
    
    // Dopo il logout, dovremmo essere reindirizzati alla pagina di login
    cy.url().should('include', '/auth');
  });
});