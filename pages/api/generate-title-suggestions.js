/**
 * API route per generare suggerimenti di titoli utilizzando OpenAI
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
      richiesta: "titolo" // Specifica che vogliamo solo il titolo
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
        error: error.message || 'Errore nella generazione del titolo' 
      });
    }

    const data = await response.json();
    
    // Restituisci solo il titolo nella formato atteso dal frontend esistente
    return res.status(200).json({ suggestions: data.titolo });
  } catch (error) {
    console.error("Errore nella generazione del titolo:", error);
    return res.status(500).json({ 
      error: error.message || "Si è verificato un errore durante la generazione del titolo" 
    });
  }
}