// Test end-to-end per la ricerca di proprietà

describe('Ricerca Proprietà', () => {
  beforeEach(() => {
    // Visita la homepage prima di ogni test
    cy.visit('/');
  });

  it('dovrebbe visualizzare la search box nella home', () => {
    // Verifica che la searchbox sia presente
    cy.get('[data-testid="search-box"]').should('be.visible');
    cy.contains('Cerca il tuo prossimo alloggio').should('be.visible');
  });

  it('dovrebbe consentire di selezionare una città', () => {
    // Apri il dropdown delle città
    cy.get('[data-testid="city-select"]').click();
    
    // Scegli una città
    cy.contains('Milano, Italia').click();
    
    // Verifica che la selezione sia stata applicata
    cy.get('[data-testid="city-select"]').should('contain', 'Milano');
  });

  it('dovrebbe consentire di selezionare un tipo di alloggio', () => {
    // Apri il dropdown del tipo di alloggio
    cy.get('[data-testid="property-type-select"]').click();
    
    // Scegli un tipo
    cy.contains('Appartamento').click();
    
    // Verifica che la selezione sia stata applicata
    cy.get('[data-testid="property-type-select"]').should('contain', 'Appartamento');
  });

  it('dovrebbe consentire di impostare un prezzo massimo', () => {
    // Trova lo slider del prezzo e imposta un valore
    cy.get('[data-testid="price-slider"]').as('priceSlider');
    
    // A seconda di come è implementato lo slider, potrebbe essere necessario
    // utilizzare un approccio diverso per l'interazione
    cy.get('@priceSlider').invoke('val', 800).trigger('change');
    
    // Verifica che il valore del prezzo sia stato aggiornato
    cy.get('[data-testid="price-display"]').should('contain', '800');
  });

  it('dovrebbe eseguire una ricerca e mostrare i risultati', () => {
    // Imposta i parametri di ricerca
    // Città
    cy.get('[data-testid="city-select"]').click();
    cy.contains('Milano, Italia').click();
    
    // Tipo di alloggio
    cy.get('[data-testid="property-type-select"]').click();
    cy.contains('Appartamento').click();
    
    // Prezzo
    cy.get('[data-testid="price-slider"]').invoke('val', 1000).trigger('change');
    
    // Esegui la ricerca
    cy.get('[data-testid="search-button"]').click();
    
    // Verifica di essere nella pagina di risultati
    cy.url().should('include', '/search');
    
    // Verifica che i risultati siano visualizzati
    cy.get('[data-testid="property-card"]').should('exist');
    
    // Verifica che i filtri applicati siano visualizzati
    cy.get('[data-testid="active-filters"]').should('contain', 'Milano');
    cy.get('[data-testid="active-filters"]').should('contain', 'Appartamento');
    cy.get('[data-testid="active-filters"]').should('contain', '1000');
  });

  it('dovrebbe mostrare un messaggio se non ci sono risultati', () => {
    // Imposta parametri di ricerca che probabilmente non daranno risultati
    // Città
    cy.get('[data-testid="city-select"]').click();
    cy.contains('Roma, Italia').click();
    
    // Tipo di alloggio molto specifico
    cy.get('[data-testid="property-type-select"]').click();
    cy.contains('Villa').click();
    
    // Prezzo molto basso
    cy.get('[data-testid="price-slider"]').invoke('val', 100).trigger('change');
    
    // Esegui la ricerca
    cy.get('[data-testid="search-button"]').click();
    
    // Verifica che sia mostrato un messaggio di nessun risultato
    cy.contains('Nessun risultato trovato').should('be.visible');
    
    // Verifica la presenza di suggerimenti alternativi
    cy.contains('Prova a modificare i filtri').should('be.visible');
  });

  it('dovrebbe permettere di navigare ai dettagli di una proprietà dai risultati', () => {
    // Esegui una ricerca generica
    cy.get('[data-testid="search-button"]').click();
    
    // Attendi che i risultati siano caricati
    cy.get('[data-testid="property-card"]').should('exist');
    
    // Clicca sulla prima proprietà
    cy.get('[data-testid="property-card"]').first().click();
    
    // Verifica di essere nella pagina di dettaglio
    cy.url().should('include', '/property/');
    
    // Verifica che i dettagli della proprietà siano visualizzati
    cy.get('[data-testid="property-details"]').should('exist');
    cy.get('[data-testid="property-title"]').should('exist');
    cy.get('[data-testid="property-price"]').should('exist');
    cy.get('[data-testid="property-description"]').should('exist');
  });

  it('dovrebbe permettere di salvare una ricerca se autenticati', () => {
    // Prima effettua il login
    cy.visit('/auth');
    
    const username = 'propertyowner';
    const password = 'OwnerPassword123';

    cy.get('form').first().within(() => {
      cy.get('input[name="username"]').type(username);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
    });
    
    // Torna alla homepage
    cy.visit('/');
    
    // Imposta i parametri di ricerca
    cy.get('[data-testid="city-select"]').click();
    cy.contains('Milano, Italia').click();
    
    // Esegui la ricerca
    cy.get('[data-testid="search-button"]').click();
    
    // Salva la ricerca
    cy.get('[data-testid="save-search-button"]').click();
    
    // Verifica che appaia una conferma
    cy.contains('Ricerca salvata con successo').should('be.visible');
  });
});