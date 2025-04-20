/**
 * API wrapper per il microservizio di dynamic pricing
 */

import { db } from '../../../server/db';
import { properties } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Endpoint per ottenere suggerimenti di prezzo dinamici
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }
  
  try {
    const { propertyId, customData } = req.body;
    
    if (!propertyId && !customData) {
      return res.status(400).json({
        error: 'Devi fornire propertyId o customData'
      });
    }
    
    let propertyData = customData;
    
    // Se è stato fornito un propertyId, recupera i dati della proprietà dal database
    if (propertyId && !customData) {
      // Recupera i dati della proprietà dal database
      const property = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
      
      if (!property || property.length === 0) {
        return res.status(404).json({ error: 'Proprietà non trovata' });
      }
      
      // Converti i dati della proprietà nel formato richiesto dal modello ML
      const propertyObj = property[0];
      
      propertyData = {
        location_score: calculateLocationScore(propertyObj),
        square_meters: propertyObj.size || 0,
        room_count: propertyObj.rooms || 1,
        has_balcony: propertyObj.has_balcony ? 1 : 0,
        floor: propertyObj.floor || 0,
        building_age: calculateBuildingAge(propertyObj),
        demand_score: calculateDemandScore(propertyObj),
        season: getCurrentSeason(),
        current_price: propertyObj.price || 0
      };
    }
    
    // Chiamata al servizio ML
    const mlResponse = await fetch('http://localhost:5001/dynamic-pricing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData),
    });
    
    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.error('Errore dal servizio ML:', errorText);
      return res.status(mlResponse.status).json({ 
        error: 'Errore nel servizio ML',
        details: errorText
      });
    }
    
    const result = await mlResponse.json();
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Errore nel dynamic pricing:', error);
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  }
}

/**
 * Calcola un punteggio di posizione basato sui dati della proprietà
 * @param {Object} property Oggetto proprietà
 * @returns {number} Punteggio da 1 a 10
 */
function calculateLocationScore(property) {
  // Logica semplificata per il punteggio di posizione
  // In una versione reale, utilizzerebbe dati più sofisticati
  
  let score = 5; // Punteggio base
  
  // Modifica in base alla zona (ipotetica proprietà nella tabella)
  if (property.neighborhood_quality === 'high') score += 3;
  if (property.neighborhood_quality === 'medium') score += 1;
  if (property.neighborhood_quality === 'low') score -= 2;
  
  // Modifica in base alla presenza di servizi
  if (property.near_transportation) score += 1;
  if (property.near_center) score += 1;
  
  // Normalizza tra 1 e 10
  return Math.max(1, Math.min(10, score));
}

/**
 * Calcola l'età dell'edificio basata sull'anno di costruzione
 * @param {Object} property Oggetto proprietà
 * @returns {number} Età in anni
 */
function calculateBuildingAge(property) {
  if (!property.construction_year) return 20; // Valore predefinito
  
  const currentYear = new Date().getFullYear();
  return currentYear - property.construction_year;
}

/**
 * Calcola un punteggio di domanda basato sulla popolarità della proprietà
 * @param {Object} property Oggetto proprietà
 * @returns {number} Punteggio da 1 a 10
 */
function calculateDemandScore(property) {
  // In una versione reale, utilizzerebbe analytics, visualizzazioni, ecc.
  // Questa è una versione semplificata
  
  let score = 5; // Punteggio base
  
  // Modifica in base alle visualizzazioni (ipotetiche)
  if (property.view_count > 1000) score += 3;
  else if (property.view_count > 500) score += 2;
  else if (property.view_count > 200) score += 1;
  
  // Modifica in base ai contatti ricevuti
  if (property.contact_count > 50) score += 2;
  else if (property.contact_count > 20) score += 1;
  
  // Normalizza tra 1 e 10
  return Math.max(1, Math.min(10, score));
}

/**
 * Restituisce la stagione corrente come numero (1-4)
 * @returns {number} 1=Estate, 2=Autunno, 3=Inverno, 4=Primavera
 */
function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // getMonth() restituisce 0-11
  
  if (month >= 6 && month <= 8) return 1; // Estate
  if (month >= 9 && month <= 11) return 2; // Autunno
  if (month === 12 || month <= 2) return 3; // Inverno
  return 4; // Primavera (3-5)
}