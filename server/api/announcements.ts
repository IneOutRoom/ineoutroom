import express from "express";
import { db } from "../db";
import { properties } from "@shared/schema";
import { canPublishListing, markFreeListingAsUsed, decrementRemainingListings } from "../services/subscriptionService";
import { eq, count, and, desc } from "drizzle-orm";

const router = express.Router();

// Endpoint per ottenere gli annunci dell'utente corrente
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId === 'me' && req.isAuthenticated() 
      ? req.user!.id 
      : req.query.userId ? parseInt(req.query.userId as string) : null;
    
    if (!userId) {
      return res.status(400).json({ 
        error: "BAD_REQUEST", 
        message: "UserId non specificato o non valido" 
      });
    }
    
    const announcements = await db
      .select()
      .from(properties)
      .where(eq(properties.userId, userId))
      .orderBy(desc(properties.createdAt));
    
    res.json(announcements);
  } catch (error: any) {
    console.error("Errore nel recupero degli annunci:", error);
    res.status(500).json({ 
      error: "SERVER_ERROR", 
      message: error.message || "Si è verificato un errore nel recupero degli annunci" 
    });
  }
});

// Endpoint per la creazione di un nuovo annuncio
router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      error: "UNAUTHORIZED", 
      message: "È necessario effettuare l'accesso per pubblicare un annuncio" 
    });
  }

  const userId = req.user!.id;
  
  try {
    // Verifica se l'utente può pubblicare l'annuncio
    const allowed = await canPublishListing(userId);
    
    if (!allowed) {
      return res.status(402).json({
        error: "FIRST_FREE_ONLY",
        message: "Hai già pubblicato la tua inserzione gratuita. Scegli un piano per continuare."
      });
    }

    // Conta gli annunci dell'utente per determinare se è il primo
    const [result] = await db
      .select({ count: count() })
      .from(properties)
      .where(eq(properties.userId, userId));
    
    const isFirstListing = (result?.count || 0) === 0;
    
    // Crea l'annuncio
    const newAnnouncement = {
      ...req.body,
      userId,
      // Calcola la data di scadenza (30 giorni da oggi)
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true
    };
    
    const [createdAnnouncement] = await db
      .insert(properties)
      .values(newAnnouncement)
      .returning();

    // Se è il primo annuncio, marca la flag usedFreeListing
    if (isFirstListing) {
      await markFreeListingAsUsed(userId);
    } else {
      // Se ha un abbonamento attivo con un numero limitato di annunci, decrementa
      await decrementRemainingListings(userId);
    }

    res.status(201).json(createdAnnouncement);
  } catch (error: any) {
    console.error("Errore nella pubblicazione dell'annuncio:", error);
    res.status(500).json({ 
      error: "SERVER_ERROR", 
      message: error.message || "Si è verificato un errore nella pubblicazione dell'annuncio" 
    });
  }
});

export default router;