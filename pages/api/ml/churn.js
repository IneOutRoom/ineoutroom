/**
 * API wrapper per il microservizio di predictive churn
 */

import { db } from '../../../server/db';
import { users } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Endpoint per prevedere il rischio di abbandono degli utenti
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
      
      // Recupera anche i dati di engagement (teoricamente da altre tabelle)
      // In una versione reale, questi dati dovrebbero provenire da analytics, log, ecc.
      
      const userObj = user[0];
      
      // Simula il recupero di dati di engagement
      const engagementData = await fetchEngagementData(userId);
      
      // Converti i dati dell'utente nel formato richiesto dal modello ML
      userData = {
        days_since_last_login: calculateDaysSinceLastLogin(userObj),
        days_active_last_month: engagementData.days_active_last_month,
        total_properties_viewed: engagementData.total_properties_viewed,
        messages_sent: engagementData.messages_sent,
        properties_listed: engagementData.properties_listed,
        subscription_months: calculateSubscriptionMonths(userObj)
      };
    }
    
    // Chiamata al servizio ML
    const mlResponse = await fetch('http://localhost:5001/churn', {
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
    console.error('Errore nella previsione churn:', error);
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  }
}

/**
 * Calcola il numero di giorni dall'ultimo login
 * @param {Object} user Oggetto utente
 * @returns {number} Giorni dall'ultimo login
 */
function calculateDaysSinceLastLogin(user) {
  if (!user.last_login_at) return 30; // Valore predefinito se non c'è last_login_at
  
  const lastLogin = new Date(user.last_login_at);
  const today = new Date();
  
  const diffTime = Math.abs(today - lastLogin);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Calcola i mesi di abbonamento
 * @param {Object} user Oggetto utente
 * @returns {number} Mesi di abbonamento
 */
function calculateSubscriptionMonths(user) {
  if (!user.subscription_started_at) return 0;
  
  const subscriptionStart = new Date(user.subscription_started_at);
  const today = new Date();
  
  // Differenza in millisecondi
  const diffTime = Math.abs(today - subscriptionStart);
  
  // Converti in mesi (approssimativo)
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  
  return diffMonths;
}

/**
 * Recupera dati di engagement per un utente (simulato)
 * @param {number} userId ID dell'utente
 * @returns {Object} Dati di engagement
 */
async function fetchEngagementData(userId) {
  // In una versione reale, questi dati proverrebbero da analytics, log, ecc.
  // Per ora, utilizziamo valori simulati
  
  // Genera valori pseudo-casuali ma consistenti basati sull'ID utente
  const seed = userId * 13;
  
  return {
    days_active_last_month: (seed % 20) + 1, // 1-20 giorni
    total_properties_viewed: (seed % 50) + 5, // 5-54 proprietà
    messages_sent: (seed % 15), // 0-14 messaggi
    properties_listed: (seed % 3) // 0-2 proprietà
  };
}