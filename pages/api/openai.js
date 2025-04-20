/**
 * API route per generare contenuto specifico (titolo o descrizione)
 * Utilizza il nostro endpoint generaTesto.js per ottenere contenuti ottimizzati
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  // Estrai i parametri dalla richiesta
  const { prompt, campo, propertyType, city, zone, size } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt mancante" });
  }

  // Costruisci i dati dell'annuncio in un formato strutturato
  const datiAnnuncio = {
    prompt,
    propertyType: propertyType || "Proprietà",
    city: city || "città",
    zone: zone || "",
    size: size || "",
    richiesta: campo === 'titolo' ? 'titolo' : 'descrizione'
  };

  try {
    // Chiamata all'endpoint generaTesto.js invece di chiamare direttamente OpenAI
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/generaTesto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datiAnnuncio })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        error: data.error || 'Errore nella generazione del contenuto',
        tipo: 'generico'
      });
    }

    // Estrai solo il campo richiesto (titolo o descrizione)
    let output = '';
    if (campo === 'titolo') {
      output = data.titolo;
    } else if (campo === 'descrizione') {
      output = data.descrizione;
    }

    // Restituisci solo il campo richiesto, mantenendo la compatibilità con il componente esistente
    return res.status(200).json({ output });
  } catch (error) {
    console.error("Errore nell'accesso all'API generaTesto:", error);
    return res.status(500).json({
      error: "Errore nella generazione del contenuto AI",
      tipo: 'generico'
    });
  }
}