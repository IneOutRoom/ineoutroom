/**
 * API route ottimizzata per generare titoli e descrizioni di annunci immobiliari utilizzando OpenAI
 * Supporta tre modalità: "titolo", "descrizione" o "completa" (entrambi)
 */
import { OpenAI } from "openai";

// Inizializza OpenAI con la chiave API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  // Estrai i parametri dalla richiesta
  const { datiAnnuncio } = req.body;

  if (!datiAnnuncio || !datiAnnuncio.propertyType || !datiAnnuncio.city) {
    return res.status(400).json({ error: "Mancano i dati essenziali dell'annuncio (tipo di proprietà, città)" });
  }

  try {
    // Determina se generare solo titolo, solo descrizione o entrambi
    const modalitaRichiesta = datiAnnuncio.richiesta || "completa";

    // Controlla se la chiave API OpenAI è configurata
    if (!process.env.OPENAI_API_KEY) {
      console.error("API Key OpenAI non configurata");
      return res.status(500).json({ error: "API Key OpenAI non configurata. Controlla le variabili d'ambiente." });
    }

    // Costruisci il prompt basato sui dati dell'annuncio
    const prompt = costruisciPrompt(datiAnnuncio, modalitaRichiesta);

    // Effettua la chiamata a OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // il modello più recente di OpenAI (rilasciato maggio 2024)
      messages: [
        {
          role: "system",
          content: "Sei un esperto agente immobiliare che crea annunci persuasivi e professionali per proprietà in affitto con focus sul mercato europeo. Usa sempre parole specifiche e dettagliate. Non usare punti esclamativi eccessivi. Mantieni un tono professionale ma coinvolgente."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    // Estrai i risultati dalla risposta
    const risultato = JSON.parse(completion.choices[0].message.content);

    // Restituisci i risultati in base alla modalità richiesta
    if (modalitaRichiesta === "titolo") {
      return res.status(200).json({ titolo: risultato.titolo });
    } else if (modalitaRichiesta === "descrizione") {
      return res.status(200).json({ descrizione: risultato.descrizione });
    } else {
      // Modalità completa (default)
      return res.status(200).json({ 
        titolo: risultato.titolo, 
        descrizione: risultato.descrizione 
      });
    }
  } catch (error) {
    console.error("Errore nella generazione del testo con OpenAI:", error);
    
    // Gestione errori specifica per OpenAI
    if (error.name === 'APIError') {
      return res.status(error.status || 500).json({ 
        error: `Errore OpenAI: ${error.message}`,
        code: error.code
      });
    }
    
    return res.status(500).json({ 
      error: "Si è verificato un errore durante la generazione del testo",
      details: error.message 
    });
  }
}

/**
 * Costruisce il prompt per OpenAI basato sui dati dell'annuncio
 */
function costruisciPrompt(datiAnnuncio, modalitaRichiesta) {
  const {
    propertyType,
    city,
    zone = "",
    size = 0,
    rooms = 0,
    bathrooms = 0,
    features = [],
    language = "italiano"
  } = datiAnnuncio;

  // Traduci il tipo di proprietà in formato leggibile
  const tipoProprietaReadable = 
    propertyType === 'stanza_singola' ? 'Stanza Singola' :
    propertyType === 'stanza_doppia' ? 'Stanza Doppia' :
    propertyType === 'monolocale' ? 'Monolocale' :
    propertyType === 'bilocale' ? 'Bilocale' :
    propertyType.charAt(0).toUpperCase() + propertyType.slice(1).replace('_', ' ');

  // Costruisci il prompt base con i dettagli dell'annuncio
  let promptBase = `Genera un annuncio immobiliare in lingua ${language} per una ${tipoProprietaReadable} situata a ${city}`;
  
  if (zone) {
    promptBase += `, nella zona ${zone}`;
  }
  
  promptBase += ".\n\n";
  
  // Aggiungi dettagli della proprietà se disponibili
  let dettagli = "Dettagli della proprietà:\n";
  
  if (size > 0) {
    dettagli += `- Dimensione: ${size} m²\n`;
  }
  
  if (rooms > 0) {
    dettagli += `- Numero di stanze: ${rooms}\n`;
  }
  
  if (bathrooms > 0) {
    dettagli += `- Numero di bagni: ${bathrooms}\n`;
  }
  
  if (features && features.length > 0) {
    dettagli += `- Caratteristiche: ${features.join(", ")}\n`;
  }
  
  promptBase += dettagli;
  
  // Istruzioni specifiche in base alla modalità richiesta
  let istruzioni = "";
  
  if (modalitaRichiesta === "titolo") {
    istruzioni = `
    Genera solo un titolo accattivante e conciso per l'annuncio (massimo 80 caratteri).
    Il titolo dovrebbe essere persuasivo ma onesto, evidenziando i punti di forza principali.
    
    Rispondi in formato JSON con questa struttura:
    {
      "titolo": "Il titolo generato"
    }
    `;
  } else if (modalitaRichiesta === "descrizione") {
    istruzioni = `
    Genera solo una descrizione dettagliata per l'annuncio (massimo 300 parole).
    La descrizione dovrebbe essere persuasiva ma onesta, includere tutti i dettagli forniti e
    sottolineare i vantaggi di vivere in questa proprietà e nella sua zona.
    
    Rispondi in formato JSON con questa struttura:
    {
      "descrizione": "La descrizione generata"
    }
    `;
  } else {
    // Modalità completa
    istruzioni = `
    Genera sia un titolo accattivante (massimo 80 caratteri) che una descrizione dettagliata (massimo 300 parole).
    Il titolo dovrebbe essere persuasivo ma onesto, evidenziando i punti di forza principali.
    La descrizione dovrebbe includere tutti i dettagli forniti e sottolineare i vantaggi di vivere in questa proprietà e nella sua zona.
    
    Rispondi in formato JSON con questa struttura:
    {
      "titolo": "Il titolo generato",
      "descrizione": "La descrizione generata"
    }
    `;
  }
  
  return promptBase + "\n" + istruzioni;
}