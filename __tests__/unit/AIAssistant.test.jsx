import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIAssistant } from '@/components/ai/AIAssistant';
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
  if (url.includes('/api/ai/assistant')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ 
        response: 'Posso aiutarti a trovare un appartamento a Milano. Quale tipo di alloggio stai cercando?',
        suggestedProperties: [
          { 
            id: 1, 
            title: 'Appartamento a Milano', 
            price: 800,
            type: 'apartment',
            bedrooms: 2,
            cityId: 1
          },
          { 
            id: 2, 
            title: 'Stanza in condivisione', 
            price: 400,
            type: 'room',
            bedrooms: 1,
            cityId: 1
          }
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

describe('AIAssistant Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('renders assistant interface correctly', () => {
    renderWithQueryClient(<AIAssistant />);
    
    // Verifica che l'interfaccia dell'assistente sia presente
    expect(screen.getByText(/Assistente Virtuale In&Out/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Chiedimi qualcosa.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /invia/i })).toBeInTheDocument();
  });

  test('sends message and displays AI response', async () => {
    renderWithQueryClient(<AIAssistant />);
    
    // Trova l'input e il pulsante di invio
    const input = screen.getByPlaceholderText(/Chiedimi qualcosa.../i);
    const sendButton = screen.getByRole('button', { name: /invia/i });
    
    // Inserisci e invia un messaggio
    fireEvent.change(input, { target: { value: 'Cerco un appartamento a Milano' } });
    fireEvent.click(sendButton);
    
    // Verifica che il messaggio dell'utente sia visualizzato
    expect(screen.getByText('Cerco un appartamento a Milano')).toBeInTheDocument();
    
    // Attendi e verifica la risposta AI
    await waitFor(() => {
      expect(screen.getByText(/Posso aiutarti a trovare un appartamento a Milano/i)).toBeInTheDocument();
    });
    
    // Verifica che vengano mostrati i suggerimenti di proprietà
    await waitFor(() => {
      expect(screen.getByText('Appartamento a Milano')).toBeInTheDocument();
      expect(screen.getByText('Stanza in condivisione')).toBeInTheDocument();
    });
  });

  test('shows loading state while waiting for AI response', async () => {
    // Modifica il mock fetch per ritardare la risposta
    global.fetch.mockImplementationOnce(() =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({ 
              response: 'Risposta ritardata',
              suggestedProperties: []
            })
          });
        }, 1000);
      })
    );
    
    renderWithQueryClient(<AIAssistant />);
    
    // Invia un messaggio
    const input = screen.getByPlaceholderText(/Chiedimi qualcosa.../i);
    const sendButton = screen.getByRole('button', { name: /invia/i });
    
    fireEvent.change(input, { target: { value: 'Messaggio di test' } });
    fireEvent.click(sendButton);
    
    // Verifica lo stato di caricamento
    expect(await screen.findByText(/sto pensando.../i, {}, { timeout: 500 })).toBeInTheDocument();
    
    // Attendi la risposta
    await waitFor(() => {
      expect(screen.getByText('Risposta ritardata')).toBeInTheDocument();
    }, { timeout: 3000 });
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
    
    renderWithQueryClient(<AIAssistant />);
    
    // Invia un messaggio
    const input = screen.getByPlaceholderText(/Chiedimi qualcosa.../i);
    const sendButton = screen.getByRole('button', { name: /invia/i });
    
    fireEvent.change(input, { target: { value: 'Messaggio che genera errore' } });
    fireEvent.click(sendButton);
    
    // Verifica il messaggio di errore
    await waitFor(() => {
      expect(screen.getByText(/Mi dispiace, si è verificato un errore./i)).toBeInTheDocument();
    });
  });
});