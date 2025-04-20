const { OpenAIService } = require('../../server/services/openaiService');

// Mock di OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockImplementation(async (options) => {
              if (options.messages[0].content.includes('Genera una descrizione')) {
                return {
                  choices: [
                    {
                      message: {
                        content: 'Splendido appartamento situato in una posizione centrale, luminoso e ben arredato.'
                      },
                      finish_reason: 'stop'
                    }
                  ]
                };
              } else if (options.messages[0].content.includes('Analizza il prezzo')) {
                return {
                  choices: [
                    {
                      message: {
                        content: JSON.stringify({
                          suggestedPrice: 800,
                          analysis: 'Basato sui dati di mercato, questo è un prezzo competitivo.'
                        })
                      },
                      finish_reason: 'stop'
                    }
                  ]
                };
              } else if (options.messages[0].content.includes('Trova proprietà simili')) {
                return {
                  choices: [
                    {
                      message: {
                        content: JSON.stringify({
                          recommendations: [1, 2, 3],
                          explanation: 'Queste proprietà hanno caratteristiche simili.'
                        })
                      },
                      finish_reason: 'stop'
                    }
                  ]
                };
              } else if (options.messages[0].content.includes('Assistente')) {
                return {
                  choices: [
                    {
                      message: {
                        content: 'Posso aiutarti a trovare una casa a Milano. Che tipo di alloggio stai cercando?'
                      },
                      finish_reason: 'stop'
                    }
                  ]
                };
              } else {
                throw new Error('Prompt non riconosciuto nei test');
              }
            })
          }
        },
        images: {
          generate: jest.fn().mockImplementation(async () => {
            return {
              data: [
                {
                  url: 'https://example.com/image.png'
                }
              ]
            };
          })
        }
      };
    })
  };
});

describe('OpenAIService', () => {
  let openAIService;
  
  beforeEach(() => {
    // Reset ambientale
    process.env.OPENAI_API_KEY = 'test-api-key';
    openAIService = new OpenAIService();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('dovrebbe generare una descrizione per una proprietà', async () => {
    const property = {
      title: 'Appartamento in centro',
      type: 'apartment',
      size: 80,
      bedrooms: 2,
      bathrooms: 1,
      city: 'Milano',
      price: 800
    };
    
    const description = await openAIService.generatePropertyDescription(property);
    
    expect(description).toBe('Splendido appartamento situato in una posizione centrale, luminoso e ben arredato.');
  });

  test('dovrebbe suggerire un prezzo per una proprietà', async () => {
    const property = {
      type: 'apartment',
      size: 80,
      bedrooms: 2,
      bathrooms: 1,
      city: 'Milano'
    };
    
    const similarProperties = [
      { price: 780, size: 75, bedrooms: 2 },
      { price: 820, size: 85, bedrooms: 2 },
      { price: 750, size: 78, bedrooms: 2 }
    ];
    
    const priceAnalysis = await openAIService.suggestPropertyPrice(property, similarProperties);
    
    expect(priceAnalysis).toHaveProperty('suggestedPrice', 800);
    expect(priceAnalysis).toHaveProperty('analysis');
  });

  test('dovrebbe raccomandare proprietà simili', async () => {
    const property = {
      id: 1,
      type: 'apartment',
      size: 80,
      bedrooms: 2,
      bathrooms: 1,
      city: 'Milano',
      price: 800
    };
    
    const allProperties = [
      { id: 2, type: 'apartment', size: 75, bedrooms: 2, city: 'Milano', price: 780 },
      { id: 3, type: 'apartment', size: 85, bedrooms: 2, city: 'Milano', price: 820 },
      { id: 4, type: 'room', size: 25, bedrooms: 1, city: 'Milano', price: 400 },
      { id: 5, type: 'apartment', size: 90, bedrooms: 3, city: 'Roma', price: 900 }
    ];
    
    const recommendations = await openAIService.recommendSimilarProperties(property, allProperties);
    
    expect(recommendations).toHaveProperty('recommendations');
    expect(recommendations.recommendations).toEqual([1, 2, 3]);
    expect(recommendations).toHaveProperty('explanation');
  });

  test('dovrebbe rispondere a domande dell\'assistente', async () => {
    const userMessage = 'Sto cercando casa a Milano';
    const chatHistory = [
      { role: 'user', content: 'Ciao' },
      { role: 'assistant', content: 'Ciao! Come posso aiutarti oggi?' }
    ];
    
    const response = await openAIService.getAssistantResponse(userMessage, chatHistory);
    
    expect(response).toBe('Posso aiutarti a trovare una casa a Milano. Che tipo di alloggio stai cercando?');
  });

  test('dovrebbe generare immagini per la proprietà', async () => {
    const property = {
      title: 'Appartamento in centro',
      type: 'apartment',
      city: 'Milano',
      description: 'Splendido appartamento moderno'
    };
    
    const imageUrl = await openAIService.generatePropertyImage(property);
    
    expect(imageUrl).toBe('https://example.com/image.png');
  });

  test('dovrebbe gestire errori nella chiamata all\'API', async () => {
    // Forza un errore nel mock
    require('openai').default.mockImplementationOnce(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      };
    });
    
    const openAIServiceWithError = new OpenAIService();
    const property = {
      title: 'Appartamento in centro',
      type: 'apartment',
      size: 80,
      bedrooms: 2,
      bathrooms: 1,
      city: 'Milano',
      price: 800
    };
    
    await expect(openAIServiceWithError.generatePropertyDescription(property))
      .rejects
      .toThrow('Errore nella generazione della descrizione');
  });

  test('dovrebbe lanciare un errore se API key non è presente', async () => {
    // Rimuovi API key
    delete process.env.OPENAI_API_KEY;
    
    expect(() => new OpenAIService()).toThrow('OpenAI API key non trovata');
  });
});