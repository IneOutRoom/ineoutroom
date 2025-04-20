import { log } from "../vite";
import openaiClient from "./openaiClient";

export interface PropertyAttributes {
  propertyType: string;
  city: string;
  zone?: string;
  squareMeters?: number;
  rooms?: number;
  bathrooms?: number; 
  features?: string[];
  language?: string;
}

export interface GenerationResult {
  title?: string;
  description?: string;
  error?: string;
}

// Traduzione dei tipi di proprietà in italiano per il prompt
const propertyTypeTranslation: Record<string, string> = {
  'stanza_singola': 'stanza singola',
  'stanza_doppia': 'stanza doppia',
  'monolocale': 'monolocale',
  'bilocale': 'bilocale',
  'altro': 'appartamento'
};

/**
 * Genera suggerimenti di titoli accattivanti per un annuncio immobiliare
 */
export async function generateTitleSuggestions(property: PropertyAttributes): Promise<string> {
  const language = property.language || 'italiano';
  const propertyTypeText = propertyTypeTranslation[property.propertyType] || property.propertyType;
  
  // Costruisci informazioni disponibili sulla proprietà
  let propertyInfo = `${propertyTypeText} a ${property.city}`;
  if (property.zone) propertyInfo += `, zona ${property.zone}`;
  if (property.squareMeters) propertyInfo += `, ${property.squareMeters} mq`;
  if (property.rooms) propertyInfo += `, ${property.rooms} ${property.rooms === 1 ? 'stanza' : 'stanze'}`;
  if (property.bathrooms) propertyInfo += `, ${property.bathrooms} ${property.bathrooms === 1 ? 'bagno' : 'bagni'}`;
  
  // Aggiungi features se disponibili
  let featuresText = '';
  if (property.features && property.features.length > 0) {
    featuresText = `Con caratteristiche: ${property.features.join(', ')}`;
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

  try {
    log(`Generazione titolo per proprietà: ${propertyInfo}`, "ai");
    
    const response = await openaiClient.chatWithAssistant(
      [{
        role: "system",
        content: "Sei un esperto di marketing immobiliare specializzato nella creazione di titoli accattivanti per annunci di proprietà."
      }], 
      prompt
    );

    return response.response.trim() || "Titolo non generato. Riprova più tardi.";
  } catch (error: any) {
    log(`Errore nella generazione del titolo: ${error.message}`, "ai");
    throw new Error(`Errore nella generazione del titolo: ${error.message}`);
  }
}

/**
 * Genera una descrizione dettagliata per un annuncio immobiliare
 */
export async function generateDescription(property: PropertyAttributes): Promise<string> {
  const language = property.language || 'italiano';
  const propertyTypeText = propertyTypeTranslation[property.propertyType] || property.propertyType;
  
  // Costruisci informazioni disponibili sulla proprietà
  let propertyInfo = `${propertyTypeText} a ${property.city}`;
  if (property.zone) propertyInfo += `, zona ${property.zone}`;
  if (property.squareMeters) propertyInfo += `, ${property.squareMeters} mq`;
  if (property.rooms) propertyInfo += `, ${property.rooms} ${property.rooms === 1 ? 'stanza' : 'stanze'}`;
  if (property.bathrooms) propertyInfo += `, ${property.bathrooms} ${property.bathrooms === 1 ? 'bagno' : 'bagni'}`;
  
  // Aggiungi features se disponibili
  let featuresText = '';
  if (property.features && property.features.length > 0) {
    featuresText = `Caratteristiche principali: ${property.features.join(', ')}`;
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

  try {
    log(`Generazione descrizione per proprietà: ${propertyInfo}`, "ai");
    
    // Convertiamo la proprietà nel formato atteso da openaiClient
    const params = {
      type: property.propertyType,
      size: property.squareMeters,
      city: property.city,
      zone: property.zone || null,
      features: property.features
    };
    
    const description = await openaiClient.generatePropertyDescription(params);
    return description.trim() || "Descrizione non generata. Riprova più tardi.";
  } catch (error: any) {
    log(`Errore nella generazione della descrizione: ${error.message}`, "ai");
    throw new Error(`Errore nella generazione della descrizione: ${error.message}`);
  }
}