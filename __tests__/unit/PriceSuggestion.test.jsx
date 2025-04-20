import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PriceSuggestion } from '@/components/properties/price-suggestion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock di useAuth
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'testuser', email: 'test@example.com' },
    isLoading: false
  })
}));

// Mock della risposta API
global.fetch = jest.fn((url) => {
  if (url.includes('/api/suggest-price')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ 
        suggestedPrice: 800,
        marketAverage: 750,
        minPrice: 600,
        maxPrice: 900,
        confidence: 0.85,
        similarProperties: [
          { id: 1, title: 'Appartamento simile 1', price: 780 },
          { id: 2, title: 'Appartamento simile 2', price: 820 }
        ]
      })
    });
  }
  return Promise.reject(new Error('not found'));
});

const renderWithQueryClient = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('PriceSuggestion Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('renders price suggestion interface correctly', () => {
    renderWithQueryClient(<PriceSuggestion />);
    
    // Verifica che l'interfaccia di suggerimento prezzo sia presente
    expect(screen.getByText(/Suggerimento Prezzo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo di alloggio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Città/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dimensione/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /suggerisci prezzo/i })).toBeInTheDocument();
  });

  test('calculates price suggestion when form is submitted', async () => {
    renderWithQueryClient(<PriceSuggestion />);
    
    // Compila il form
    const typeSelect = screen.getByLabelText(/Tipo di alloggio/i);
    fireEvent.change(typeSelect, { target: { value: 'apartment' } });
    
    const citySelect = screen.getByLabelText(/Città/i);
    fireEvent.change(citySelect, { target: { value: '1' } }); // Supponiamo che 1 sia l'ID di Milano
    
    const sizeInput = screen.getByLabelText(/Dimensione/i);
    fireEvent.change(sizeInput, { target: { value: '80' } });
    
    const bedroomsInput = screen.getByLabelText(/Camere da letto/i);
    fireEvent.change(bedroomsInput, { target: { value: '2' } });
    
    // Invia il form
    const submitButton = screen.getByRole('button', { name: /suggerisci prezzo/i });
    fireEvent.click(submitButton);
    
    // Verifica che venga mostrato lo stato di caricamento
    expect(screen.getByText(/Calcolando.../i)).toBeInTheDocument();
    
    // Attendi i risultati
    await waitFor(() => {
      expect(screen.getByText(/Prezzo suggerito: 800 €/i)).toBeInTheDocument();
    });
    
    // Verifica che vengano mostrati altri dettagli
    expect(screen.getByText(/Media di mercato: 750 €/i)).toBeInTheDocument();
    expect(screen.getByText(/Intervallo: 600 € - 900 €/i)).toBeInTheDocument();
    expect(screen.getByText(/Livello di confidenza: 85%/i)).toBeInTheDocument();
    
    // Verifica che vengano mostrate proprietà simili
    expect(screen.getByText(/Appartamento simile 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Appartamento simile 2/i)).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    // Modifica il mock fetch per simulare un errore
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })
    );
    
    renderWithQueryClient(<PriceSuggestion />);
    
    // Compila e invia il form
    const typeSelect = screen.getByLabelText(/Tipo di alloggio/i);
    fireEvent.change(typeSelect, { target: { value: 'apartment' } });
    
    const citySelect = screen.getByLabelText(/Città/i);
    fireEvent.change(citySelect, { target: { value: '1' } });
    
    const sizeInput = screen.getByLabelText(/Dimensione/i);
    fireEvent.change(sizeInput, { target: { value: '80' } });
    
    const submitButton = screen.getByRole('button', { name: /suggerisci prezzo/i });
    fireEvent.click(submitButton);
    
    // Verifica il messaggio di errore
    await waitFor(() => {
      expect(screen.getByText(/Si è verificato un errore durante il calcolo del prezzo/i)).toBeInTheDocument();
    });
  });

  test('validates form inputs before submission', async () => {
    renderWithQueryClient(<PriceSuggestion />);
    
    // Invia il form senza compilare i campi
    const submitButton = screen.getByRole('button', { name: /suggerisci prezzo/i });
    fireEvent.click(submitButton);
    
    // Verifica che vengano mostrati messaggi di errore per i campi obbligatori
    expect(screen.getByText(/Tipo di alloggio richiesto/i)).toBeInTheDocument();
    expect(screen.getByText(/Città richiesta/i)).toBeInTheDocument();
    expect(screen.getByText(/Dimensione richiesta/i)).toBeInTheDocument();
  });
});