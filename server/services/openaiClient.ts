import OpenAI from "openai";
import { log } from "../vite";

// Verifica che la chiave API sia disponibile
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY non è impostata. Per utilizzare la generazione AI è necessario configurare questa variabile di ambiente.");
}

// Inizializza il client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Interfacce per i parametri
export interface PropertyDescriptionParams {
  type: string;
  size?: number | null;
  city: string;
  zone?: string | null;
  features?: string[] | null;
  language?: string;
}

export interface SentimentAnalysisResult {
  score: number;       // Punteggio da -1 (negativo) a 1 (positivo)
  label: "positivo" | "neutro" | "negativo";
  confidence: number;  // Confidenza da 0 a 1
}

export interface TranslationParams {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface PriceSuggestionParams {
  type: string;            // Tipo di proprietà (monolocale, bilocale, ecc.)
  size: number;            // Metri quadri
  city: string;            // Città
  zone?: string | null;    // Zona/quartiere
  rooms?: number;          // Numero di stanze
  bathrooms?: number;      // Numero di bagni
  features?: string[];     // Caratteristiche (terrazzo, giardino, ecc.)
  compareWith?: {
    id: number;
    price: number;
    similarity: number;
  }[];                     // Proprietà simili per confronto
}

export interface PriceSuggestionResult {
  suggestedPrice: number;
  confidence: number;
  market: "alto" | "medio" | "basso";
  priceRange: {
    min: number;
    max: number;
  };
  comparableProperties?: Array<{
    id: number;
    price: number;
    similarity: number;
  }>;
  explanation: string;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  response: string;
  conversationHistory: Message[];
}

export interface FraudDetectionParams {
  title: string;
  description: string;
  price: number;
  city: string;
  zone?: string;
  features?: string[];
  imageUrls?: string[];
}

export interface FraudDetectionResult {
  isSuspicious: boolean;
  confidence: number;
  reasons: string[];
  riskScore: number; // 0-100
}

class OpenAIClient {
  /**
   * Genera una descrizione per un annuncio immobiliare
   */
  async generatePropertyDescription(params: PropertyDescriptionParams): Promise<string> {
    try {
      const language = params.language || 'italiano';
      const typeText = this.getPropertyTypeText(params.type);
      
      // Costruisci informazioni sulla proprietà
      let propertyInfo = `${typeText} a ${params.city}`;
      if (params.zone) propertyInfo += `, zona ${params.zone}`;
      if (params.size) propertyInfo += `, ${params.size} mq`;
      
      // Aggiungi features se disponibili
      let featuresText = '';
      if (params.features && params.features.length > 0) {
        featuresText = `Caratteristiche principali: ${params.features.join(', ')}`;
      }
      
      // Crea il prompt per OpenAI
      const prompt = language === 'italiano' 
        ? `Genera una descrizione dettagliata e persuasiva per un annuncio immobiliare di un ${propertyInfo}.
           ${featuresText}
           
           La descrizione deve:
           - Essere di circa 150-200 parole
           - Avere un tono professionale ma accogliente
           - Evidenziare i punti di forza della proprietà
           - Menzionare la posizione e i servizi nelle vicinanze
           - Descrivere l'atmosfera e lo stile della proprietà
           - Includere un invito all'azione finale
           
           Restituisci solo la descrizione, senza titoli aggiuntivi.`
        : `Generate a detailed and persuasive description for a real estate listing of a ${propertyInfo}.
           ${featuresText}
           
           The description should:
           - Be about 150-200 words
           - Have a professional but welcoming tone
           - Highlight the strengths of the property
           - Mention the location and nearby amenities
           - Describe the atmosphere and style of the property
           - Include a final call to action
           
           Return only the description, without additional titles.`;
      
      log(`Generazione descrizione per proprietà: ${propertyInfo}`, "ai");
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Sei un esperto di marketing immobiliare specializzato nella creazione di descrizioni dettagliate e persuasive per annunci di proprietà." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });
      
      return response.choices[0].message.content?.trim() || 
        "Descrizione non generata. Riprova più tardi.";
    } catch (error: any) {
      log(`Errore nella generazione della descrizione: ${error.message}`, "error");
      throw new Error(`Errore nella generazione della descrizione: ${error.message}`);
    }
  }
  
  /**
   * Genera un titolo accattivante per un annuncio immobiliare
   */
  async generatePropertyTitle(params: PropertyDescriptionParams): Promise<string> {
    try {
      const language = params.language || 'italiano';
      const typeText = this.getPropertyTypeText(params.type);
      
      // Costruisci informazioni sulla proprietà
      let propertyInfo = `${typeText} a ${params.city}`;
      if (params.zone) propertyInfo += `, zona ${params.zone}`;
      if (params.size) propertyInfo += `, ${params.size} mq`;
      
      // Aggiungi features se disponibili
      let featuresText = '';
      if (params.features && params.features.length > 0) {
        featuresText = `Con caratteristiche: ${params.features.join(', ')}`;
      }
      
      // Crea il prompt per OpenAI
      const prompt = language === 'italiano' 
        ? `Genera un titolo accattivante per un annuncio immobiliare per un ${propertyInfo}. ${featuresText}
           Il titolo deve essere conciso (massimo 10 parole), descrittivo e persuasivo per attirare inquilini.
           Deve evidenziare gli aspetti più interessanti della proprietà.
           Restituisci solo il titolo, senza virgolette o altri caratteri aggiuntivi.`
        : `Generate a catchy title for a real estate listing for a ${propertyInfo}. ${featuresText}
           The title should be concise (maximum 10 words), descriptive and persuasive to attract tenants.
           It should highlight the most interesting aspects of the property.
           Return only the title, without quotes or additional characters.`;
      
      log(`Generazione titolo per proprietà: ${propertyInfo}`, "ai");
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Sei un esperto di marketing immobiliare specializzato nella creazione di titoli accattivanti per annunci di proprietà." },
          { role: "user", content: prompt }
        ],
        max_tokens: 60,
        temperature: 0.7,
      });
      
      return response.choices[0].message.content?.trim() || 
        "Titolo non generato. Riprova più tardi.";
    } catch (error: any) {
      log(`Errore nella generazione del titolo: ${error.message}`, "error");
      throw new Error(`Errore nella generazione del titolo: ${error.message}`);
    }
  }

  /**
   * Analizza il sentiment di un testo e restituisce un punteggio
   */
  async analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
    try {
      log(`Analisi del sentiment per testo: ${text.substring(0, 50)}...`, "ai");
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "Sei un analista di sentiment specializzato. Analizza il testo fornito e restituisci un oggetto JSON con le seguenti proprietà: score (da -1 a 1, dove -1 è molto negativo e 1 è molto positivo), label (una delle seguenti: 'positivo', 'neutro', 'negativo'), confidence (un valore da 0 a 1 che indica quanto sei sicuro dell'analisi)." 
          },
          { role: "user", content: text }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Verifica che il risultato sia valido e contiene tutti i campi richiesti
      if (!result.score || !result.label || !result.confidence) {
        throw new Error("Risposta incompleta dall'API di OpenAI");
      }
      
      return {
        score: parseFloat(result.score),
        label: result.label as "positivo" | "neutro" | "negativo",
        confidence: parseFloat(result.confidence)
      };
    } catch (error: any) {
      log(`Errore nell'analisi del sentiment: ${error.message}`, "error");
      throw new Error(`Errore nell'analisi del sentiment: ${error.message}`);
    }
  }
  
  /**
   * Verifica se un testo contiene contenuti inappropriati
   */
  async moderateContent(text: string): Promise<boolean> {
    try {
      log(`Moderazione del testo: ${text.substring(0, 50)}...`, "ai");
      const response = await openai.moderations.create({
        input: text
      });
      
      // Se flagged è true, il testo contiene contenuti inappropriati
      return !response.results[0].flagged;
    } catch (error: any) {
      log(`Errore nella moderazione del contenuto: ${error.message}`, "error");
      throw new Error(`Errore nella moderazione del contenuto: ${error.message}`);
    }
  }
  
  /**
   * Genera un suggerimento di prezzo per una proprietà
   */
  async suggestPrice(params: PriceSuggestionParams): Promise<PriceSuggestionResult> {
    try {
      log(`Generazione suggerimento prezzo per: ${params.type} a ${params.city}`, "ai");
      
      const typeText = this.getPropertyTypeText(params.type);
      
      let propertyInfo = `Tipo: ${typeText}, ${params.size} mq, Città: ${params.city}`;
      if (params.zone) propertyInfo += `, Zona: ${params.zone}`;
      if (params.rooms) propertyInfo += `, ${params.rooms} stanze`;
      if (params.bathrooms) propertyInfo += `, ${params.bathrooms} bagni`;
      
      let featuresText = '';
      if (params.features && params.features.length > 0) {
        featuresText = `Caratteristiche: ${params.features.join(', ')}`;
      }
      
      let comparablePropertiesText = '';
      if (params.compareWith && params.compareWith.length > 0) {
        comparablePropertiesText = "Proprietà simili per confronto:\n";
        params.compareWith.forEach(property => {
          comparablePropertiesText += `- ID: ${property.id}, Prezzo: ${property.price} €, Somiglianza: ${property.similarity}\n`;
        });
      }
      
      const prompt = `
        Analizza i dettagli di questa proprietà immobiliare e suggerisci un prezzo di mercato appropriato:
        ${propertyInfo}
        ${featuresText}
        ${comparablePropertiesText}
        
        Fornisci una risposta in formato JSON con le seguenti proprietà:
        - suggestedPrice: il prezzo suggerito in Euro (numero intero)
        - confidence: un valore da 0 a 1 che indica la tua confidenza nel suggerimento
        - market: una stringa che indica se il mercato in quella zona è "alto", "medio" o "basso"
        - priceRange: un oggetto con proprietà min e max che rappresentano l'intervallo di prezzo ragionevole
        - explanation: una breve spiegazione del suggerimento
        
        Se ci sono proprietà comparabili, usale come riferimento principale per la tua valutazione.
      `;
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "Sei un esperto valutatore immobiliare con ampia conoscenza del mercato italiano ed europeo. Fornisci stime accurate basate sui dati di mercato." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Verifica che il risultato sia valido
      if (!result.suggestedPrice || !result.confidence || !result.market || !result.priceRange || !result.explanation) {
        throw new Error("Risposta incompleta dall'API di OpenAI");
      }
      
      return {
        suggestedPrice: parseInt(result.suggestedPrice),
        confidence: parseFloat(result.confidence),
        market: result.market as "alto" | "medio" | "basso",
        priceRange: {
          min: parseInt(result.priceRange.min),
          max: parseInt(result.priceRange.max)
        },
        comparableProperties: params.compareWith,
        explanation: result.explanation
      };
    } catch (error: any) {
      log(`Errore nella generazione del suggerimento di prezzo: ${error.message}`, "error");
      throw new Error(`Errore nella generazione del suggerimento di prezzo: ${error.message}`);
    }
  }

  /**
   * Traduce un testo nella lingua specificata
   */
  async translateText(params: TranslationParams): Promise<string> {
    try {
      const sourceLanguageText = params.sourceLanguage 
        ? `da ${params.sourceLanguage} ` 
        : '';
      
      log(`Traduzione del testo ${sourceLanguageText}in ${params.targetLanguage}`, "ai");
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: `Sei un traduttore professionale. Traduci il testo ${sourceLanguageText}in ${params.targetLanguage}. Fornisci solo la traduzione, senza spiegazioni o commenti aggiuntivi.` 
          },
          { role: "user", content: params.text }
        ],
        temperature: 0.3
      });
      
      return response.choices[0].message.content?.trim() || 
        "Traduzione non riuscita. Riprova più tardi.";
    } catch (error: any) {
      log(`Errore nella traduzione del testo: ${error.message}`, "error");
      throw new Error(`Errore nella traduzione del testo: ${error.message}`);
    }
  }
  
  /**
   * Interagisce con l'assistente virtuale
   */
  async chatWithAssistant(history: Message[], query: string): Promise<ChatResponse> {
    try {
      log(`Interazione con assistente: ${query.substring(0, 50)}...`, "ai");
      
      // Crea la cronologia della conversazione per il contesto
      const conversationHistory = [...history];
      
      // Aggiungi la query dell'utente
      conversationHistory.push({
        role: "user",
        content: query
      });
      
      // Prepara il prompt per l'assistente
      const systemPrompt = `
        Sei l'assistente virtuale di In&Out, una piattaforma di annunci immobiliari per tutta Europa.
        
        Linee guida:
        1. Rispondi in modo conciso e utile alle domande sull'immobiliare.
        2. Fornisci consigli pratici per la ricerca di alloggi.
        3. Spiega come funziona il mercato immobiliare in diverse città europee.
        4. Fornisci informazioni sui documenti necessari per affittare o comprare casa.
        5. Aiuta gli utenti a comprendere termini e concetti immobiliari.
        6. Rispondi SEMPRE in italiano a meno che l'utente non chieda esplicitamente un'altra lingua.
        7. Sii cordiale, professionale e orientato al servizio.
        8. Tieni le risposte brevi ma informative, massimo 150 parole.
        
        Non inventare funzionalità della piattaforma, non aiutare con attività illegali, e non fornire consulenza legale o finanziaria specifica.
      `;
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      const assistantResponse = response.choices[0].message.content?.trim() || 
        "Mi dispiace, non sono riuscito a elaborare la tua richiesta. Puoi riprovare?";
      
      // Aggiungi la risposta dell'assistente alla cronologia
      conversationHistory.push({
        role: "assistant",
        content: assistantResponse
      });
      
      return {
        response: assistantResponse,
        conversationHistory
      };
    } catch (error: any) {
      log(`Errore nella chat con l'assistente: ${error.message}`, "error");
      throw new Error(`Errore nella chat con l'assistente: ${error.message}`);
    }
  }
  
  /**
   * Rileva potenziali annunci fraudolenti
   */
  async detectFraud(params: FraudDetectionParams): Promise<FraudDetectionResult> {
    try {
      log(`Rilevamento frodi per annuncio: ${params.title}`, "ai");
      
      const imageUrlsText = params.imageUrls && params.imageUrls.length > 0
        ? `URLs delle immagini: ${params.imageUrls.join(', ')}`
        : 'Nessuna immagine fornita';
      
      const featuresText = params.features && params.features.length > 0
        ? `Caratteristiche: ${params.features.join(', ')}`
        : 'Nessuna caratteristica specificata';
      
      const prompt = `
        Analizza questo annuncio immobiliare e valuta se potrebbe essere fraudolento:
        
        Titolo: ${params.title}
        Descrizione: ${params.description}
        Prezzo: ${params.price} €
        Città: ${params.city}
        ${params.zone ? `Zona: ${params.zone}` : ''}
        ${featuresText}
        ${imageUrlsText}
        
        Fornisci una risposta in formato JSON con le seguenti proprietà:
        - isSuspicious: booleano che indica se l'annuncio sembra sospetto
        - confidence: un valore da 0 a 1 che indica la tua confidenza in questa valutazione
        - reasons: un array di stringhe che spiegano perché l'annuncio potrebbe essere fraudolento (vuoto se non sospetto)
        - riskScore: un punteggio da 0 a 100 che indica il livello di rischio
      `;
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "Sei un esperto nel rilevare annunci immobiliari fraudolenti. La tua valutazione deve essere imparziale e basata su criteri oggettivi come: prezzo irrealisticamente basso, mancanza di dettagli, linguaggio evasivo, richieste insolite, segni di phishing, immagini rubate o incoerenti, pressione per pagamenti anticipati." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Verifica che il risultato sia valido
      if (result.isSuspicious === undefined || !result.confidence || !Array.isArray(result.reasons) || result.riskScore === undefined) {
        throw new Error("Risposta incompleta dall'API di OpenAI");
      }
      
      return {
        isSuspicious: result.isSuspicious,
        confidence: parseFloat(result.confidence),
        reasons: result.reasons,
        riskScore: parseInt(result.riskScore)
      };
    } catch (error: any) {
      log(`Errore nel rilevamento frodi: ${error.message}`, "error");
      throw new Error(`Errore nel rilevamento frodi: ${error.message}`);
    }
  }
  
  /**
   * Utility per convertire il tipo di proprietà in un formato leggibile
   */
  private getPropertyTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      'stanza_singola': 'stanza singola',
      'stanza_doppia': 'stanza doppia',
      'monolocale': 'monolocale',
      'bilocale': 'bilocale',
      'trilocale': 'trilocale',
      'quadrilocale': 'quadrilocale',
      'appartamento': 'appartamento',
      'casa': 'casa',
      'villa': 'villa',
      'attico': 'attico',
      'loft': 'loft',
      'altro': 'proprietà'
    };
    
    return typeMap[type.toLowerCase()] || type;
  }
}

export default new OpenAIClient();