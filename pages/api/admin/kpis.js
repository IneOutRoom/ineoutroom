import { db } from '../../../server/db';
import { users, properties } from '../../../shared/schema';
import { eq, gte, sql } from 'drizzle-orm';

/**
 * API endpoint per ottenere i KPI amministrativi
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler(req, res) {
  // Verifica metodo HTTP
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    // Verifica se l'utente è autenticato e ha ruolo admin
    if (!req.session?.passport?.user) {
      return res.status(401).json({ error: 'Non autorizzato' });
    }

    // Ottieni l'utente dalla sessione
    const userId = req.session.passport.user;
    const userResult = await db.select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0 || userResult[0].role !== 'admin') {
      return res.status(403).json({ error: 'Accesso negato - Richiesti privilegi di amministratore' });
    }

    // Calcola la data di 30 giorni fa
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Dati iscrizioni ultimi 30 giorni (suddivisi per giorno)
    const signupsLast30Days = await db.select({
      date: sql`DATE(${users.createdAt})`,
      count: sql`COUNT(*)`,
    })
    .from(users)
    .where(gte(users.createdAt, thirtyDaysAgo))
    .groupBy(sql`DATE(${users.createdAt})`)
    .orderBy(sql`DATE(${users.createdAt})`);
    
    // Dati annunci ultimi 30 giorni (suddivisi per giorno)
    const announcementsLast30Days = await db.select({
      date: sql`DATE(${properties.createdAt})`,
      count: sql`COUNT(*)`,
    })
    .from(properties)
    .where(gte(properties.createdAt, thirtyDaysAgo))
    .groupBy(sql`DATE(${properties.createdAt})`)
    .orderBy(sql`DATE(${properties.createdAt})`);
    
    // Dati tempo medio di sessione (mockup, normalmente verrebbe da dati analytics)
    // In produzione utilizzerebbe dati reali da un sistema di analytics
    const avgSessionTimeData = [
      { date: '2025-03-19', avgMinutes: 4.2 },
      { date: '2025-03-20', avgMinutes: 3.8 },
      { date: '2025-03-21', avgMinutes: 5.1 },
      { date: '2025-03-22', avgMinutes: 4.7 },
      { date: '2025-03-23', avgMinutes: 3.9 },
      { date: '2025-03-24', avgMinutes: 4.5 },
      { date: '2025-03-25', avgMinutes: 5.3 },
      { date: '2025-03-26', avgMinutes: 4.8 },
      { date: '2025-03-27', avgMinutes: 4.2 },
      { date: '2025-03-28', avgMinutes: 3.9 },
      { date: '2025-03-29', avgMinutes: 4.1 },
      { date: '2025-03-30', avgMinutes: 4.4 },
      { date: '2025-03-31', avgMinutes: 4.7 },
      { date: '2025-04-01', avgMinutes: 5.0 },
      { date: '2025-04-02', avgMinutes: 5.2 },
      { date: '2025-04-03', avgMinutes: 4.9 },
      { date: '2025-04-04', avgMinutes: 4.6 },
      { date: '2025-04-05', avgMinutes: 4.3 },
      { date: '2025-04-06', avgMinutes: 4.1 },
      { date: '2025-04-07', avgMinutes: 4.5 },
      { date: '2025-04-08', avgMinutes: 4.8 },
      { date: '2025-04-09', avgMinutes: 5.1 },
      { date: '2025-04-10', avgMinutes: 4.7 },
      { date: '2025-04-11', avgMinutes: 4.4 },
      { date: '2025-04-12', avgMinutes: 4.2 },
      { date: '2025-04-13', avgMinutes: 4.6 },
      { date: '2025-04-14', avgMinutes: 4.9 },
      { date: '2025-04-15', avgMinutes: 5.3 },
      { date: '2025-04-16', avgMinutes: 5.0 },
      { date: '2025-04-17', avgMinutes: 4.7 },
      { date: '2025-04-18', avgMinutes: 4.9 },
    ];
    
    // Calcola il tempo medio di sessione complessivo
    const avgSessionTime = avgSessionTimeData.reduce((sum, item) => sum + item.avgMinutes, 0) / avgSessionTimeData.length;
    
    // Formatta le date per una migliore visualizzazione
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    };
    
    const formattedSignups = signupsLast30Days.map(item => ({
      date: formatDate(item.date),
      count: Number(item.count)
    }));
    
    const formattedAnnouncements = announcementsLast30Days.map(item => ({
      date: formatDate(item.date),
      count: Number(item.count)
    }));
    
    const formattedAvgSessionTime = avgSessionTimeData.map(item => ({
      date: formatDate(item.date),
      avgMinutes: item.avgMinutes
    }));
    
    // Restituisci i dati
    return res.status(200).json({
      signupsLast30Days: formattedSignups,
      announcementsLast30Days: formattedAnnouncements,
      avgSessionTimeData: formattedAvgSessionTime,
      avgSessionTime: Math.round(avgSessionTime * 10) / 10 // Arrotonda a 1 decimale
    });

  } catch (error) {
    console.error('Errore nel recupero dei KPI:', error);
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  }
}