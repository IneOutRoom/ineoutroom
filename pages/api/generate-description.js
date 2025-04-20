/**
 * API route per generare descrizioni di annunci immobiliari utilizzando OpenAI
 * Ottimizzato per utilizzare il nuovo endpoint generaTesto.js
 */
import { apiRequest } from "../../client/src/lib/queryClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  // Estrai i parametri dalla richiesta
  const { propertyType, city, zone, squareMeters, rooms, bathrooms, features, language } = req.body;

  if (!propertyType || !city) {
    return res.status(400).json({ error: "Tipo di proprietà e città sono obbligatori" });
  }

  try {
    // Costruisci i dati dell'annuncio da inviare all'endpoint generaTesto
    const datiAnnuncio = {
      propertyType,
      city,
      zone,
      size: squareMeters,
      rooms,
      bathrooms,
      features: Array.isArray(features) ? features : [],
      language: language || "italiano",
      richiesta: "descrizione" // Specifica che vogliamo solo la descrizione
    };

    // Utilizza il nostro nuovo endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/generaTesto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datiAnnuncio })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ 
        error: error.message || 'Errore nella generazione della descrizione' 
      });
    }

    const data = await response.json();
    
    // Restituisci solo la descrizione nel formato atteso dal frontend esistente
    return res.status(200).json({ description: data.descrizione });
  } catch (error) {
    console.error("Errore nella generazione della descrizione:", error);
    return res.status(500).json({ 
      error: error.message || "Si è verificato un errore durante la generazione della descrizione" 
    });
  }
}