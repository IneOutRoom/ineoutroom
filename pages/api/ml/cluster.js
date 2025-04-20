/**
 * API wrapper per il microservizio di user clustering
 */

import { db } from '../../../server/db';
import { users } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Endpoint per il clustering degli utenti
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }
  
  try {
    const { userId, customData } = req.body;
    
    if (!userId && !customData) {
      return res.status(400).json({
        error: 'Devi fornire userId o customData'
      });
    }
    
    let userData = customData;
    
    // Se è stato fornito un userId, recupera i dati dell'utente dal database
    if (userId && !customData) {
      // Recupera i dati dell'utente dal database
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (!user || user.length === 0) {
        return res.status(404).json({ error: 'Utente non trovato' });
      }
      
      // Recupera anche i dati comportamentali (teoricamente da altre tabelle)
      // In una versione reale, questi dati dovrebbero provenire da analytics, log, ecc.
      
      const userObj = user[0];
      
      // Simula il recupero di dati comportamentali
      const behaviorData = await fetchUserBehaviorData(userId);
      
      // Converti i dati dell'utente nel formato richiesto dal modello ML
      userData = {
        properties_viewed_monthly: behaviorData.properties_viewed_monthly,
        avg_view_duration_sec: behaviorData.avg_view_duration_sec,
        search_count_monthly: behaviorData.search_count_monthly,
        msg_sent_monthly: behaviorData.msg_sent_monthly,
        msg_response_rate: behaviorData.msg_response_rate,
        avg_response_time_hrs: behaviorData.avg_response_time_hrs,
        properties_listed: behaviorData.properties_listed,
        listing_completeness: behaviorData.listing_completeness,
        listing_updates_monthly: behaviorData.listing_updates_monthly,
        login_frequency_weekly: behaviorData.login_frequency_weekly,
        session_duration_min: behaviorData.session_duration_min,
        completed_profile: calculateProfileCompleteness(userObj),
        subscription_tier: getSubscriptionTier(userObj),
        days_since_registration: calculateDaysSinceRegistration(userObj)
      };
    }
    
    // Chiamata al servizio ML
    const mlResponse = await fetch('http://localhost:5001/cluster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
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
    console.error('Errore nel clustering utenti:', error);
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  }
}

/**
 * Calcola il livello di completezza del profilo utente
 * @param {Object} user Oggetto utente
 * @returns {number} Valore tra 0 e 1
 */
function calculateProfileCompleteness(user) {
  // Campi da considerare per la completezza
  const fields = [
    'name',
    'email', 
    'profileImage', 
    'bio', 
    'phone', 
    'address',
    'preferences'
  ];
  
  let completedFields = 0;
  
  // Conta i campi compilati
  fields.forEach(field => {
    if (user[field]) completedFields++;
  });
  
  // Calcola percentuale (0-1)
  return completedFields / fields.length;
}

/**
 * Restituisce il tier dell'abbonamento come numero
 * @param {Object} user Oggetto utente
 * @returns {number} 0=Free, 1=Standard, 2=Premium
 */
function getSubscriptionTier(user) {
  if (!user.subscriptionPlan) return 0;
  
  switch (user.subscriptionPlan) {
    case 'single': return 0;
    case 'standard': return 1;
    case 'premium': return 2;
    default: return 0;
  }
}

/**
 * Calcola i giorni dalla registrazione
 * @param {Object} user Oggetto utente
 * @returns {number} Giorni dalla registrazione
 */
function calculateDaysSinceRegistration(user) {
  if (!user.createdAt) return 0;
  
  const registrationDate = new Date(user.createdAt);
  const today = new Date();
  
  const diffTime = Math.abs(today - registrationDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Recupera dati comportamentali per un utente (simulato)
 * @param {number} userId ID dell'utente
 * @returns {Object} Dati comportamentali
 */
async function fetchUserBehaviorData(userId) {
  // In una versione reale, questi dati proverrebbero da analytics, log, ecc.
  // Per ora, utilizziamo valori simulati
  
  // Genera valori pseudo-casuali ma consistenti basati sull'ID utente
  const seed = userId * 13;
  
  return {
    properties_viewed_monthly: (seed % 30) + 5, // 5-34 proprietà
    avg_view_duration_sec: (seed % 60) + 60, // 60-119 secondi
    search_count_monthly: (seed % 25) + 5, // 5-29 ricerche
    msg_sent_monthly: (seed % 20), // 0-19 messaggi
    msg_response_rate: (seed % 100) / 100, // 0-0.99
    avg_response_time_hrs: (seed % 12) + 1, // 1-12 ore
    properties_listed: (seed % 4), // 0-3 proprietà
    listing_completeness: ((seed % 5) + 5) / 10, // 0.5-0.9
    listing_updates_monthly: (seed % 5), // 0-4 aggiornamenti
    login_frequency_weekly: (seed % 6) + 1, // 1-6 login
    session_duration_min: (seed % 20) + 5 // 5-24 minuti
  };
}