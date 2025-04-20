import { Request, Response } from 'express';
import { db } from '../db';
import { properties } from '@shared/schema';
import { eq, and, gte, lte, like, between, or, inArray } from 'drizzle-orm';

// Cerca proprietà in base ai filtri e ai bounds della mappa
export async function searchProperties(req: Request, res: Response) {
  try {
    const {
      q,                   // Termine di ricerca generale (città, indirizzo, etc.)
      type,                // Tipo di proprietà
      minPrice,            // Prezzo minimo
      maxPrice,            // Prezzo massimo
      north, south, east, west,  // Bounds della mappa
      isFurnished,         // Ammobiliata
      allowsPets,          // Ammette animali
      internetIncluded,    // Internet incluso
    } = req.body;

    // Costruisci le condizioni di filtro
    const conditions = [];

    if (q) {
      // Cerca nel titolo, descrizione o indirizzo
      conditions.push(
        or(
          like(properties.title, `%${q}%`),
          like(properties.description, `%${q}%`),
          like(properties.address, `%${q}%`)
        )
      );
    }

    if (type) {
      conditions.push(eq(properties.propertyType, type));
    }

    if (minPrice !== undefined) {
      conditions.push(gte(properties.price, Number(minPrice)));
    }

    if (maxPrice !== undefined) {
      conditions.push(lte(properties.price, Number(maxPrice)));
    }

    // Filtri per gli extra
    if (isFurnished !== undefined) {
      conditions.push(eq(properties.isFurnished, Boolean(isFurnished)));
    }

    if (allowsPets !== undefined) {
      conditions.push(eq(properties.allowsPets, Boolean(allowsPets)));
    }

    if (internetIncluded !== undefined) {
      conditions.push(eq(properties.internetIncluded, Boolean(internetIncluded)));
    }

    // Filtro per bounds geografici
    if (north && south && east && west) {
      conditions.push(between(properties.latitude, Number(south), Number(north)));
      conditions.push(between(properties.longitude, Number(west), Number(east)));
    }

    // Assicurati di mostrare solo le proprietà attive
    conditions.push(eq(properties.isActive, true));

    // Esegui la query
    let query = db.select().from(properties);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Aggiungi ordinamento (default: più recenti)
    query = query.orderBy(properties.createdAt);

    const results = await query;

    // Invia i risultati
    res.json(results);
  } catch (error) {
    console.error('Errore nella ricerca delle proprietà:', error);
    res.status(500).json({ 
      error: 'Errore durante la ricerca delle proprietà',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
}

// Cerca proprietà in base ai confini della mappa (per la visualizzazione mappa Airbnb-style)
export async function getPropertiesForMap(req: Request, res: Response) {
  try {
    const { bounds } = req.body;

    // Costruisci le condizioni di filtro
    const conditions = [];

    // Filtro per bounds geografici
    if (bounds && bounds.north && bounds.south && bounds.east && bounds.west) {
      conditions.push(between(properties.latitude, Number(bounds.south), Number(bounds.north)));
      conditions.push(between(properties.longitude, Number(bounds.west), Number(bounds.east)));
    }

    // Assicurati di mostrare solo le proprietà attive
    conditions.push(eq(properties.isActive, true));

    // Esegui la query
    let query = db.select().from(properties);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Aggiungi ordinamento (default: più recenti)
    query = query.orderBy(properties.createdAt);

    const results = await query;

    // Invia i risultati
    res.json(results);
  } catch (error) {
    console.error('Errore nel recupero delle proprietà per la mappa:', error);
    res.status(500).json({ 
      error: 'Errore durante il recupero delle proprietà per la mappa',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
}