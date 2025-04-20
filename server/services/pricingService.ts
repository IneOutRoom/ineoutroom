import { db } from "../db";
import { properties } from "@shared/schema";
import { and, eq, sql } from "drizzle-orm";

/**
 * Calcola e salva le statistiche dei prezzi per città e zone
 * Questo dovrebbe essere eseguito in un job programmato (ad es. ogni notte)
 */
export async function calculatePriceStatistics() {
  try {
    console.log("Avvio calcolo statistiche prezzi...");
    
    // Ottieni tutte le combinazioni città/zona/tipo proprietà
    const locationCombinations = await db.execute(sql`
      SELECT DISTINCT 
        city, 
        zone, 
        property_type 
      FROM properties 
      WHERE is_active = true AND price > 0
    `);
    
    for (const combination of locationCombinations) {
      const { city, zone, property_type } = combination;
      
      // Skip combinazioni non valide
      if (!city) continue;
      
      // Calcola statistiche per questa combinazione
      const stats = await db.execute(sql`
        SELECT 
          AVG(price) as average_price,
          MIN(price) as min_price,
          MAX(price) as max_price,
          PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY price) as median_price,
          STDDEV(price) as std_dev,
          COUNT(*) as sample_size
        FROM properties
        WHERE 
          city = ${city} 
          ${zone ? sql`AND zone = ${zone}` : sql``}
          ${property_type ? sql`AND property_type = ${property_type}` : sql``}
          AND is_active = true
          AND price > 0
      `);
      
      if (stats.length === 0 || !stats[0].average_price) continue;
      
      // Arrotonda i valori
      const statsData = {
        city,
        zone: zone || null,
        property_type: property_type || null,
        average_price: Math.round(Number(stats[0].average_price)),
        min_price: Math.round(Number(stats[0].min_price)),
        max_price: Math.round(Number(stats[0].max_price)),
        median_price: Math.round(Number(stats[0].median_price)),
        std_dev: Math.round(Number(stats[0].std_dev)),
        sample_size: Number(stats[0].sample_size),
        last_updated: new Date()
      };
      
      // Controlla se la combinazione esiste già
      const existingStats = await db.execute(sql`
        SELECT id FROM price_stats 
        WHERE 
          city = ${city} 
          AND (zone IS NULL OR zone = ${zone || null})
          AND (property_type IS NULL OR property_type = ${property_type || null})
      `);
      
      if (existingStats.length > 0) {
        // Aggiorna statistiche esistenti
        await db.execute(sql`
          UPDATE price_stats SET
            average_price = ${statsData.average_price},
            min_price = ${statsData.min_price},
            max_price = ${statsData.max_price},
            median_price = ${statsData.median_price},
            std_dev = ${statsData.std_dev},
            sample_size = ${statsData.sample_size},
            last_updated = ${statsData.last_updated}
          WHERE id = ${existingStats[0].id}
        `);
      } else {
        // Inserisci nuove statistiche
        await db.execute(sql`
          INSERT INTO price_stats 
            (city, zone, property_type, average_price, min_price, max_price, median_price, std_dev, sample_size, last_updated)
          VALUES
            (${statsData.city}, ${statsData.zone}, ${statsData.property_type}, ${statsData.average_price}, 
             ${statsData.min_price}, ${statsData.max_price}, ${statsData.median_price}, 
             ${statsData.std_dev}, ${statsData.sample_size}, ${statsData.last_updated})
        `);
      }
    }
    
    console.log("Calcolo statistiche prezzi completato con successo");
    return { success: true };
  } catch (error) {
    console.error("Errore durante il calcolo delle statistiche dei prezzi:", error);
    throw error;
  }
}

/**
 * Ottiene il suggerimento di prezzo per una determinata posizione
 */
export async function getPriceSuggestion(city: string, zone?: string | null, propertyType?: string | null) {
  try {
    if (!city) {
      throw new Error("Città è un parametro obbligatorio");
    }
    
    // Cerca statistiche più specifiche prima (città + zona + tipo)
    const query = zone && propertyType 
      ? sql`
          SELECT * FROM price_stats
          WHERE city = ${city} AND zone = ${zone} AND property_type = ${propertyType}
          ORDER BY last_updated DESC LIMIT 1
        `
      : zone 
      ? sql`
          SELECT * FROM price_stats
          WHERE city = ${city} AND zone = ${zone}
          ORDER BY last_updated DESC LIMIT 1
        `
      : propertyType
      ? sql`
          SELECT * FROM price_stats
          WHERE city = ${city} AND property_type = ${propertyType}
          ORDER BY last_updated DESC LIMIT 1
        `
      : sql`
          SELECT * FROM price_stats
          WHERE city = ${city}
          ORDER BY last_updated DESC LIMIT 1
        `;
    
    const stats = await db.execute(query);
    
    if (stats.length === 0) {
      // Fallback a statistiche più generali (solo città)
      const fallbackStats = await db.execute(sql`
        SELECT * FROM price_stats
        WHERE city = ${city} AND zone IS NULL AND property_type IS NULL
        ORDER BY last_updated DESC LIMIT 1
      `);
      
      if (fallbackStats.length === 0) {
        return {
          available: false,
          message: "Nessuna statistica disponibile per questa zona"
        };
      }
      
      return formatPriceSuggestion(fallbackStats[0], false);
    }
    
    return formatPriceSuggestion(stats[0], true);
    
  } catch (error) {
    console.error("Errore durante il recupero del suggerimento prezzi:", error);
    throw error;
  }
}

/**
 * Formatta i dati statistici in un suggerimento di prezzo utile
 */
function formatPriceSuggestion(stats: any, isExact: boolean) {
  const { 
    average_price, 
    median_price, 
    min_price, 
    max_price, 
    std_dev, 
    sample_size, 
    city, 
    zone, 
    property_type 
  } = stats;
  
  // Calcola intervallo suggerito (media±deviazione standard, limitato dai min/max)
  const lowerBound = Math.max(min_price, average_price - std_dev);
  const upperBound = Math.min(max_price, average_price + std_dev);
  
  // Formatta l'intervallo in modo che sia ragionevole
  const suggestedMin = Math.round(lowerBound / 10) * 10; // Arrotonda ai 10€
  const suggestedMax = Math.round(upperBound / 10) * 10; // Arrotonda ai 10€
  
  return {
    available: true,
    isExact, // Indica se i dati sono specifici per la combinazione richiesta
    city,
    zone: zone || undefined,
    propertyType: property_type || undefined,
    averagePrice: average_price,
    medianPrice: median_price,
    minPrice: min_price,
    maxPrice: max_price,
    suggestedMin,
    suggestedMax,
    confidence: sample_size > 20 ? "alta" : sample_size > 5 ? "media" : "bassa",
    sampleSize: sample_size,
    lastUpdated: stats.last_updated
  };
}