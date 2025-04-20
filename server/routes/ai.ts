import express, { Request, Response } from 'express';
import { z } from 'zod';
import openaiClient, {
  PropertyDescriptionParams,
  SentimentAnalysisResult,
  PriceSuggestionParams,
  Message
} from '../services/openaiClient';
import { log } from '../vite';
import { isAuthenticated, hasRole } from '../middleware/authMiddleware';

const router = express.Router();

// Schema per i parametri di generazione della descrizione
const generateDescriptionSchema = z.object({
  type: z.string(),
  size: z.number().optional().nullable(),
  city: z.string(),
  zone: z.string().optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  language: z.string().optional()
});

export type GenerateDescriptionParams = z.infer<typeof generateDescriptionSchema>;

// Schema per i parametri di moderazione
const moderationSchema = z.object({
  text: z.string()
});

// Schema per l'analisi del sentiment
const sentimentAnalysisSchema = z.object({
  text: z.string()
});

// Schema per la traduzione
const translationSchema = z.object({
  text: z.string(),
  targetLanguage: z.string(),
  sourceLanguage: z.string().optional()
});

// Schema per il suggerimento di prezzo
const priceSuggestionSchema = z.object({
  type: z.string(),
  size: z.number(),
  city: z.string(),
  zone: z.string().optional().nullable(),
  rooms: z.number().optional(),
  bathrooms: z.number().optional(),
  features: z.array(z.string()).optional(),
  compareWith: z.array(
    z.object({
      id: z.number(),
      price: z.number(),
      similarity: z.number()
    })
  ).optional()
});

// Schema per le richieste all'assistente
const assistantSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string()
    })
  ),
  query: z.string()
});

// Schema per il rilevamento frodi
const fraudDetectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
  city: z.string(),
  zone: z.string().optional(),
  features: z.array(z.string()).optional(),
  imageUrls: z.array(z.string()).optional()
});

/**
 * Generazione titolo per annuncio
 */
router.post('/generate-title', isAuthenticated, async (req: Request, res: Response) => {
  try {
    log(`Richiesta di generazione titolo ricevuta: ${JSON.stringify(req.body)}`, "debug");
    
    const result = generateDescriptionSchema.safeParse(req.body);
    
    if (!result.success) {
      log(`Validazione fallita: ${result.error.message}`, "error");
      return res.status(400).json({ error: result.error.message });
    }
    
    const params: GenerateDescriptionParams = result.data;
    log(`Parametri validati: ${JSON.stringify(params)}`, "debug");
    
    const title = await openaiClient.generatePropertyTitle(params);
    log(`Titolo generato: ${title}`, "debug");
    
    const response = { response: title };
    log(`Risposta inviata: ${JSON.stringify(response)}`, "debug");
    res.json(response);
  } catch (error: any) {
    log(`Errore nella generazione del titolo: ${error.message}`, "error");
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generazione descrizione per annuncio
 */
router.post('/generate-description', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const result = generateDescriptionSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const params: GenerateDescriptionParams = result.data;
    const description = await openaiClient.generatePropertyDescription(params);
    
    res.json({ response: description });
  } catch (error: any) {
    log(`Errore nella generazione della descrizione: ${error.message}`, "error");
    res.status(500).json({ error: error.message });
  }
});

/**
 * Moderazione contenuti
 */
router.post('/moderate', async (req: Request, res: Response) => {
  try {
    const result = moderationSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const isAppropriate = await openaiClient.moderateContent(result.data.text);
    
    res.json({ isAppropriate });
  } catch (error: any) {
    log(`Errore nella moderazione del contenuto: ${error.message}`, "error");
    res.status(500).json({ error: error.message });
  }
});

/**
 * Analisi sentiment
 */
router.post('/analyze-sentiment', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const result = sentimentAnalysisSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const sentiment: SentimentAnalysisResult = await openaiClient.analyzeSentiment(result.data.text);
    
    res.json(sentiment);
  } catch (error: any) {
    log(`Errore nell'analisi del sentiment: ${error.message}`, "error");
    res.status(500).json({ error: error.message });
  }
});

/**
 * Traduzione testo
 */
router.post('/translate', async (req: Request, res: Response) => {
  try {
    const result = translationSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const translatedText = await openaiClient.translateText(result.data);
    
    res.json({ response: translatedText });
  } catch (error: any) {
    log(`Errore nella traduzione del testo: ${error.message}`, "error");
    res.status(500).json({ error: error.message });
  }
});

/**
 * Suggerimento prezzo
 */
router.post('/price-suggestion', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const result = priceSuggestionSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const params: PriceSuggestionParams = result.data;
    const suggestion = await openaiClient.suggestPrice(params);
    
    res.json(suggestion);
  } catch (error: any) {
    log(`Errore nel suggerimento del prezzo: ${error.message}`, "error");
    res.status(500).json({ error: error.message });
  }
});

/**
 * Assistente virtuale
 */
router.post('/assistant', async (req: Request, res: Response) => {
  try {
    const result = assistantSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const response = await openaiClient.chatWithAssistant(result.data.history, result.data.query);
    
    res.json(response);
  } catch (error: any) {
    log(`Errore nella chat con l'assistente: ${error.message}`, "error");
    res.status(500).json({ error: error.message });
  }
});

/**
 * Rilevamento annunci fraudolenti (solo admin)
 */
router.post('/detect-fraud', hasRole('admin'), async (req: Request, res: Response) => {
  try {
    const result = fraudDetectionSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const fraudDetection = await openaiClient.detectFraud(result.data);
    
    res.json(fraudDetection);
  } catch (error: any) {
    log(`Errore nel rilevamento frodi: ${error.message}`, "error");
    res.status(500).json({ error: error.message });
  }
});

export default router;