// Test end-to-end per la gestione documenti e contratti

describe('Gestione Documenti', () => {
  beforeEach(() => {
    // Login prima di ogni test
    cy.visit('/auth');
    
    const username = 'propertyowner';
    const password = 'OwnerPassword123';

    cy.get('form').first().within(() => {
      cy.get('input[name="username"]').type(username);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
    });
    
    // Verifica che siamo autenticati e naviga alla pagina documenti
    cy.url().should('not.include', '/auth');
    cy.visit('/documents');
  });

  it('dovrebbe visualizzare la lista dei documenti', () => {
    // Verifica che la pagina documenti sia caricata correttamente
    cy.contains('I miei documenti').should('be.visible');
    
    // Verifica che ci siano le sezioni per i documenti
    cy.get('[data-testid="documents-list"]').should('exist');
    cy.get('[data-testid="document-templates"]').should('exist');
  });

  it('dovrebbe visualizzare i modelli di contratto disponibili', () => {
    // Verifica che ci siano modelli di contratto disponibili
    cy.get('[data-testid="document-templates"]').within(() => {
      cy.contains('Modelli di contratto').should('be.visible');
      cy.get('[data-testid="template-card"]').should('exist');
    });
  });

  it('dovrebbe permettere di creare un nuovo documento da un modello', () => {
    // Seleziona un modello di contratto
    cy.get('[data-testid="document-templates"]').within(() => {
      cy.get('[data-testid="template-card"]').first().click();
    });
    
    // Si dovrebbe aprire la pagina di personalizzazione del contratto
    cy.url().should('include', '/documents/new');
    cy.contains('Crea nuovo documento').should('be.visible');
    
    // Compila il form per il nuovo documento
    cy.get('input[name="title"]').type('Contratto di Affitto Test');
    
    // Seleziona una proprietà per il contratto
    cy.get('[data-testid="property-select"]').click();
    cy.get('[data-testid="property-option"]').first().click();
    
    // Aggiungi informazioni del locatario
    cy.get('input[name="tenantName"]').type('Inquilino Test');
    cy.get('input[name="tenantEmail"]').type('inquilino@example.com');
    
    // Date del contratto
    cy.get('input[name="startDate"]').type('2025-05-01');
    cy.get('input[name="endDate"]').type('2026-04-30');
    
    // Salva il documento
    cy.get('button[type="submit"]').click();
    
    // Verifica che il documento sia stato creato
    cy.contains('Documento creato con successo').should('be.visible');
    
    // Dovremmo essere reindirizzati alla pagina del documento
    cy.url().should('include', '/documents/');
    cy.contains('Contratto di Affitto Test').should('be.visible');
    cy.contains('In attesa di firma').should('be.visible');
  });

  it('dovrebbe permettere di visualizzare i dettagli di un documento', () => {
    // Clicca su un documento esistente
    cy.get('[data-testid="documents-list"]').within(() => {
      cy.get('[data-testid="document-card"]').first().click();
    });
    
    // Verifica che si apra la pagina di dettaglio
    cy.url().should('include', '/documents/');
    cy.get('[data-testid="document-preview"]').should('exist');
    cy.get('[data-testid="document-details"]').should('exist');
    
    // Verifica che ci siano le informazioni del documento
    cy.get('[data-testid="document-details"]').within(() => {
      cy.contains('Titolo:').should('be.visible');
      cy.contains('Stato:').should('be.visible');
      cy.contains('Data creazione:').should('be.visible');
      cy.contains('Proprietà:').should('be.visible');
    });
  });

  it('dovrebbe permettere di inviare un documento per la firma', () => {
    // Clicca su un documento esistente
    cy.get('[data-testid="documents-list"]').within(() => {
      cy.get('[data-testid="document-card"]').first().click();
    });
    
    // Verifica che siamo nella pagina di dettaglio
    cy.url().should('include', '/documents/');
    
    // Clicca sul pulsante "Invia per firma"
    cy.get('[data-testid="send-for-signature-button"]').click();
    
    // Dovrebbe apparire una modal di conferma
    cy.get('[data-testid="confirmation-modal"]').should('be.visible');
    cy.get('[data-testid="confirmation-modal"]').within(() => {
      cy.contains('Inviare il documento per la firma?').should('be.visible');
      cy.get('button').contains('Conferma').click();
    });
    
    // Verifica conferma invio
    cy.contains('Documento inviato per la firma').should('be.visible');
    
    // Verifica che lo stato del documento sia cambiato
    cy.contains('In attesa di firma').should('be.visible');
  });

  it('dovrebbe permettere di caricare un nuovo documento', () => {
    // Clicca sul pulsante per caricare un nuovo documento
    cy.get('[data-testid="upload-document-button"]').click();
    
    // Verifica che si apra la pagina di upload
    cy.url().should('include', '/documents/upload');
    cy.contains('Carica documento').should('be.visible');
    
    // Compila il form di upload
    cy.get('input[name="title"]').type('Documento Test Caricato');
    cy.get('textarea[name="description"]').type('Descrizione del documento di test caricato');
    
    // Seleziona categoria
    cy.get('[data-testid="category-select"]').click();
    cy.contains('Contratto di affitto').click();
    
    // Seleziona una proprietà associata
    cy.get('[data-testid="property-select"]').click();
    cy.get('[data-testid="property-option"]').first().click();
    
    // Upload del file (simulato)
    cy.get('input[type="file"]').attachFile('documento-test.pdf');
    
    // Salva il documento
    cy.get('button[type="submit"]').click();
    
    // Verifica che il documento sia stato caricato
    cy.contains('Documento caricato con successo').should('be.visible');
    
    // Dovremmo essere reindirizzati alla pagina documenti
    cy.url().should('include', '/documents');
    cy.contains('Documento Test Caricato').should('be.visible');
  });

  it('dovrebbe permettere di firmare un documento ricevuto', () => {
    // Vai alla tab dei documenti da firmare
    cy.get('[data-testid="to-sign-tab"]').click();
    
    // Clicca su un documento da firmare
    cy.get('[data-testid="documents-to-sign"]').within(() => {
      cy.get('[data-testid="document-card"]').first().click();
    });
    
    // Verifica che siamo nella pagina di dettaglio
    cy.url().should('include', '/documents/');
    
    // Clicca sul pulsante "Firma"
    cy.get('[data-testid="sign-document-button"]').click();
    
    // Dovrebbe apparire una modal per la firma
    cy.get('[data-testid="signature-modal"]').should('be.visible');
    cy.get('[data-testid="signature-modal"]').within(() => {
      // Simula la firma (potrebbe essere un campo di testo o un canvas)
      cy.get('[data-testid="signature-pad"]').click(); // simula firma sul canvas
      
      cy.get('button').contains('Firma documento').click();
    });
    
    // Verifica conferma firma
    cy.contains('Documento firmato con successo').should('be.visible');
    
    // Verifica che lo stato del documento sia cambiato
    cy.contains('Firmato').should('be.visible');
  });
});