import { Express } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { properties, users, reviews, subscriptionPlanEnum } from "@shared/schema";
import { sql } from "drizzle-orm";
import monitoringRoutes from "./monitoring";
import { logInfo } from "../utils/logger";

// Middleware per verificare se l'utente è amministratore
export function isAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Autenticazione richiesta" });
  }
  
  // In un'implementazione reale, verificherebbe un campo 'isAdmin' nell'utente
  // Per ora, consideriamo gli utenti con ID=1 come amministratori
  if (req.user.id !== 1) {
    return res.status(403).json({ message: "Accesso non autorizzato" });
  }
  
  next();
}

export function registerAdminRoutes(app: Express) {
  // Registra le rotte di monitoraggio
  app.use('/api/admin', monitoringRoutes);
  
  // Logga l'inizializzazione delle rotte admin
  logInfo("Rotte di amministrazione registrate, incluso il modulo di monitoraggio");
  // Rotta per ottenere le statistiche dell'applicazione
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      // Conteggio totale annunci
      const totalProperties = await db.select({ count: sql<number>`count(*)` }).from(properties);
      
      // Conteggio utenti registrati per mese
      const monthlySignups = await db.select({
        month: sql<string>`date_trunc('month', ${users.createdAt})::text`,
        count: sql<number>`count(*)`
      })
      .from(users)
      .groupBy(sql`date_trunc('month', ${users.createdAt})`)
      .orderBy(sql`date_trunc('month', ${users.createdAt})`);
      
      // Città più popolari
      const topCities = await db.select({
        city: properties.city,
        count: sql<number>`count(*)`
      })
      .from(properties)
      .groupBy(properties.city)
      .orderBy(sql`count(*)`, "desc")
      .limit(5);
      
      // Statistiche piani di abbonamento
      const planSales = await db.select({
        plan: users.subscriptionPlan,
        count: sql<number>`count(*)`
      })
      .from(users)
      .where(sql`${users.subscriptionPlan} is not null`)
      .groupBy(users.subscriptionPlan);
      
      // Conteggio recensioni
      const totalReviews = await db.select({ count: sql<number>`count(*)` }).from(reviews);
      
      // Media rating recensioni
      const avgRating = await db.select({
        avg: sql<number>`avg(${reviews.rating})`
      }).from(reviews);
      
      // Statistiche proprietà per tipo
      const propertiesByType = await db.select({
        type: properties.propertyType,
        count: sql<number>`count(*)`
      })
      .from(properties)
      .groupBy(properties.propertyType);
      
      res.json({
        totalProperties: totalProperties[0].count,
        totalUsers: monthlySignups.reduce((acc, item) => acc + Number(item.count), 0),
        totalReviews: totalReviews[0].count,
        avgRating: avgRating[0].avg,
        monthlySignups,
        topCities,
        planSales,
        propertiesByType
      });
    } catch (error: any) {
      console.error("Errore nel recupero delle statistiche:", error);
      res.status(500).json({ message: "Errore nel recupero delle statistiche", error: error.message });
    }
  });
  
  // Rotta per ottenere le segnalazioni di recensioni da moderare
  app.get("/api/admin/reports", isAdmin, async (req, res) => {
    try {
      const reports = await storage.getReviewReports(req.query.status as string);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: "Errore nel recupero delle segnalazioni", error: error.message });
    }
  });
  
  // Rotta per aggiornare lo stato di una segnalazione
  app.patch("/api/admin/reports/:id", isAdmin, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const { status, moderatorNotes } = req.body;
      
      const updatedReport = await storage.updateReviewReport(reportId, {
        status,
        moderatorNotes,
        resolvedAt: status !== "pending" ? new Date() : undefined
      });
      
      res.json(updatedReport);
    } catch (error: any) {
      res.status(500).json({ message: "Errore nell'aggiornamento della segnalazione", error: error.message });
    }
  });
}