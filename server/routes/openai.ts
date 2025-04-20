import express, { Request, Response } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { log } from '../vite';

const router = express.Router();

// Validazione dello schema per la richiesta
const openaiRequestSchema = z.object({
  prompt: z.string().min(10),
  campo: z.enum(['titolo', 'descrizione']),
  propertyType: z.string().optional(),
  city: z.string().optional(),
  zone: z.string().optional(),
  size: z.number().optional()
});

// Inizializzazione del client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req: Request, res: Response) => {
  try {
    log(`Richiesta OpenAI ricevuta: ${JSON.stringify(req.body)}`, "debug");
    
    // Valida la richiesta
    const result = openaiRequestSchema.safeParse(req.body);
    
    if (!result.success) {
      log(`Validazione richiesta OpenAI fallita: ${result.error.message}`, "error");
      return res.status(400).json({ error: result.error.message });
    }
    
    const { prompt, campo, propertyType, city, zone, size } = result.data;
    
    // Crea un prompt arricchito con i dati della proprietà se disponibili
    let promptArricchito = prompt;
    if (propertyType || city) {
      promptArricchito += ` Per un ${propertyType || 'immobile'}`;
      if (city) {
        promptArricchito += ` a ${city}`;
        if (zone) promptArricchito += `, zona ${zone}`;
      }
      if (size) promptArricchito += ` di ${size} metri quadri`;
    }
    
    // Log del prompt finale
    log(`Prompt OpenAI finale: ${promptArricchito}`, "debug");
    
    // Parametri di generazione più adatti al tipo di contenuto
    const parameters = campo === 'titolo' 
      ? { max_tokens: 60, temperature: 0.7 }  // Titolo più creativo ma breve
      : { max_tokens: 300, temperature: 0.6 }; // Descrizione più dettagliata e moderatamente creativa
    
    // Crea il prompt di sistema
    const systemPrompt = campo === 'titolo'
      ? "Sei un esperto di marketing immobiliare specializzato nella creazione di titoli accattivanti. Crea un titolo breve ma d'impatto per un annuncio immobiliare."
      : "Sei un esperto di marketing immobiliare. Crea una descrizione persuasiva, professionale ma accogliente per un annuncio immobiliare. Evidenzia i punti di forza e concludi con un invito all'azione.";
    
    // Esegui la chiamata a OpenAI
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: promptArricchito }
      ],
      ...parameters
    });
    
    // Estrai la risposta
    const output = response.choices[0].message.content?.trim() || 
      "Impossibile generare il testo. Riprova più tardi.";
    
    log(`Risposta OpenAI ricevuta per ${campo}: ${output.substring(0, 50)}...`, "debug");
    
    // Ritorna la risposta
    res.json({ output });
    
  } catch (error: any) {
    log(`Errore nell'endpoint OpenAI: ${error.message}`, "error");
    
    // Verifica se l'errore è relativo all'API key
    if (error.message?.includes('auth') || error.message?.includes('key') || error.message?.includes('API')) {
      return res.status(500).json({ 
        error: "Errore di autenticazione con l'API OpenAI. Verifica la chiave API.",
        tipo: "autenticazione"
      });
    }
    
    // Errore generico
    res.status(500).json({ 
      error: `Errore durante la generazione del contenuto: ${error.message}`,
      tipo: "generico"
    });
  }
});

export default router;