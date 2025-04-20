import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Chat } from '@/components/chat/chat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock di useAuth
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'testuser', email: 'test@example.com' },
    isLoading: false
  })
}));

// Mock delle API e WebSocket
global.fetch = jest.fn((url) => {
  if (url.includes('/api/messages')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 1,
          senderId: 2,
          receiverId: 1,
          content: 'Ciao, sono interessato alla tua proprietà',
          createdAt: new Date().toISOString(),
          isRead: true
        },
        {
          id: 2,
          senderId: 1,
          receiverId: 2,
          content: 'Grazie per l\'interesse! Quando vorresti visitarla?',
          createdAt: new Date().toISOString(),
          isRead: false
        }
      ])
    });
  } else if (url.includes('/api/users/2')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        id: 2,
        username: 'propertyowner',
        name: 'Property Owner'
      })
    });
  } else if (url.includes('/api/properties/1')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        id: 1,
        title: 'Appartamento a Milano',
        ownerId: 2
      })
    });
  }
  return Promise.reject(new Error('not found'));
});

// Mock WebSocket
class MockWebSocket {
  constructor() {
    this.readyState = 1; // OPEN
    this.onmessage = jest.fn();
    this.onopen = jest.fn();
    this.onclose = jest.fn();
    this.onerror = jest.fn();
    this.close = jest.fn();
    
    // Esegui immediatamente onopen
    setTimeout(() => {
      if (this.onopen) this.onopen({ type: 'open' });
    }, 0);
  }
  
  send(data) {
    // Simula ricezione di un messaggio
    const message = JSON.parse(data);
    
    if (message.type === 'message') {
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({
            data: JSON.stringify({
              type: 'message',
              message: {
                id: 3,
                senderId: 1,
                receiverId: 2,
                content: message.content,
                createdAt: new Date().toISOString(),
                isRead: false
              }
            })
          });
        }
      }, 100);
    }
  }
}

// Sostituisci WebSocket globale con mock
global.WebSocket = jest.fn().mockImplementation(() => new MockWebSocket());

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

describe('Chat Component', () => {
  const chatProps = {
    propertyId: 1,
    receiverId: 2
  };
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('renders chat interface correctly', async () => {
    renderWithQueryClient(<Chat {...chatProps} />);
    
    // Verifica che l'interfaccia della chat sia presente
    expect(screen.getByPlaceholderText(/Scrivi un messaggio.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /invia/i })).toBeInTheDocument();
    
    // Attende caricamento messaggi precedenti
    await waitFor(() => {
      expect(screen.getByText('Ciao, sono interessato alla tua proprietà')).toBeInTheDocument();
      expect(screen.getByText('Grazie per l\'interesse! Quando vorresti visitarla?')).toBeInTheDocument();
    });
    
    // Verifica che ci sia l'intestazione della chat con il nome dell'altro utente
    await waitFor(() => {
      expect(screen.getByText('Property Owner')).toBeInTheDocument();
    });
  });

  test('sends and receives messages', async () => {
    renderWithQueryClient(<Chat {...chatProps} />);
    
    // Attende caricamento messaggi precedenti
    await waitFor(() => {
      expect(screen.getByText('Ciao, sono interessato alla tua proprietà')).toBeInTheDocument();
    });
    
    // Trova l'input e il pulsante di invio
    const input = screen.getByPlaceholderText(/Scrivi un messaggio.../i);
    const sendButton = screen.getByRole('button', { name: /invia/i });
    
    // Inserisci e invia un messaggio
    fireEvent.change(input, { target: { value: 'Vorrei visitarla domani pomeriggio' } });
    fireEvent.click(sendButton);
    
    // Verifica che l'input sia stato svuotato
    expect(input.value).toBe('');
    
    // Attendi che il messaggio inviato appaia nella chat
    await waitFor(() => {
      expect(screen.getByText('Vorrei visitarla domani pomeriggio')).toBeInTheDocument();
    });
  });

  test('shows message status (read/unread)', async () => {
    renderWithQueryClient(<Chat {...chatProps} />);
    
    // Attende caricamento messaggi precedenti
    await waitFor(() => {
      expect(screen.getByText('Ciao, sono interessato alla tua proprietà')).toBeInTheDocument();
    });
    
    // Verifica che ci siano indicatori di stato per i messaggi
    const messageElements = screen.getAllByTestId('message-item');
    
    // Verifica che il primo messaggio (dal proprietario) abbia stato "letto"
    await waitFor(() => {
      expect(messageElements[0]).toHaveAttribute('data-read', 'true');
    });
    
    // Verifica che il secondo messaggio (dall'utente corrente) abbia stato "non letto"
    await waitFor(() => {
      expect(messageElements[1]).toHaveAttribute('data-read', 'false');
    });
  });

  test('handles WebSocket connection errors', async () => {
    // Sovrascrivi il mock per simulare un errore di connessione
    global.WebSocket.mockImplementationOnce(() => {
      const ws = new MockWebSocket();
      
      // Simula errore di connessione
      setTimeout(() => {
        ws.onopen = null;
        if (ws.onerror) ws.onerror({ type: 'error', message: 'Connection failed' });
      }, 0);
      
      return ws;
    });
    
    renderWithQueryClient(<Chat {...chatProps} />);
    
    // Verifica messaggio di errore
    await waitFor(() => {
      expect(screen.getByText(/Errore di connessione/i)).toBeInTheDocument();
    });
  });

  test('reconnects if WebSocket connection is closed', async () => {
    // Sovrascrivi il mock per simulare disconnessione e riconnessione
    let wsInstance;
    global.WebSocket.mockImplementationOnce(() => {
      wsInstance = new MockWebSocket();
      return wsInstance;
    });
    
    renderWithQueryClient(<Chat {...chatProps} />);
    
    // Simula disconnessione
    await waitFor(() => {
      wsInstance.onclose({ type: 'close', code: 1006, reason: 'Connection lost' });
    });
    
    // Verifica tentativo di riconnessione
    await waitFor(() => {
      expect(global.WebSocket).toHaveBeenCalledTimes(2);
    });
  });
});