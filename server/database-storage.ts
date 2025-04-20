import { 
  type User, type InsertUser, type Property, type InsertProperty, 
  type SavedSearch, type InsertSavedSearch, type PropertySearch, 
  type Message, type InsertMessage, type Review, type InsertReview, 
  type ReviewVote, type InsertReviewVote, type ReviewReport, type InsertReviewReport,
  type Document, type InsertDocument, type Signature, type InsertSignature,
  type UserInteraction, type InsertUserInteraction, type City,
  users, properties, savedSearches, messages, reviews, reviewVotes, reviewReports,
  documents, signatures, userInteractions, cities
} from "@shared/schema";
import { eq, and, gte, lte, like, or, inArray, desc, isNull, isNotNull, sql, ne } from "drizzle-orm";
import { IStorage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session' 
    });
  }

  // Paesi e Città
  async getCountries(): Promise<{code: string, name: string}[]> {
    try {
      // Ottiene la lista dei paesi dalla tabella country_translations
      const result = await db.execute(sql`
        SELECT 
          country_code as code, 
          name_it as name 
        FROM 
          country_translations 
        ORDER BY 
          name_it
      `);
      
      return result.rows as {code: string, name: string}[];
    } catch (error) {
      console.error('Errore nel recupero dei paesi:', error);
      
      // Fallback con i paesi definiti nell'enum
      return [
        {code: 'IT', name: 'Italia'},
        {code: 'ES', name: 'Spagna'},
        {code: 'FR', name: 'Francia'},
        {code: 'DE', name: 'Germania'},
        {code: 'UK', name: 'Regno Unito'}
      ];
    }
  }
  
  async getCities(country?: string): Promise<City[]> {
    if (country) {
      return db.select().from(cities).where(eq(cities.country, country as any));
    }
    return db.select().from(cities);
  }

  // Utenti
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserFirebaseUid(userId: number, firebaseUid: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ firebaseUid })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: number, info: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: info.stripeCustomerId,
        stripeSubscriptionId: info.stripeSubscriptionId,
        subscriptionPlan: 'standard' as any,
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 giorni
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Proprietà
  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async getPropertiesByUser(userId: number): Promise<Property[]> {
    return db.select().from(properties).where(eq(properties.userId, userId));
  }

  async searchProperties(search: PropertySearch): Promise<Property[]> {
    // Costruiamo le condizioni di filtro 
    const conditions = [eq(properties.isActive, true)];
    
    // Aggiungiamo le condizioni basate sui filtri di ricerca
    if (search.country) {
      conditions.push(eq(properties.country, search.country));
    }
    
    if (search.propertyType) {
      conditions.push(eq(properties.propertyType, search.propertyType));
    }
    
    if (search.minPrice) {
      conditions.push(gte(properties.price, search.minPrice * 100));
    }
    
    if (search.maxPrice) {
      conditions.push(lte(properties.price, search.maxPrice * 100));
    }
    
    // Filtri avanzati
    if (search.isFurnished) {
      conditions.push(eq(properties.isFurnished, true));
    }
    
    if (search.allowsPets) {
      conditions.push(eq(properties.allowsPets, true));
    }
    
    if (search.internetIncluded) {
      conditions.push(eq(properties.internetIncluded, true));
    }
    
    // Eseguiamo la query con tutte le condizioni AND
    let results = await db.select()
      .from(properties)
      .where(and(...conditions));
    
    // Filtri manuali che non possiamo fare efficacemente con Drizzle:
    
    // 1. Filtra per città
    if (search.city) {
      const cityLower = search.city.toLowerCase();
      results = results.filter(property => 
        property.city.toLowerCase().includes(cityLower)
      );
    }
    
    // 2. Filtra per posizione (geolocalizzazione)
    if (search.latitude && search.longitude && search.radius) {
      return results.filter(property => {
        if (!property.latitude || !property.longitude) return false;
        
        // Calcolo della distanza usando la formula di Haversine
        const R = 6371; // Raggio della Terra in km
        const dLat = this.toRad(property.latitude - search.latitude!);
        const dLon = this.toRad(property.longitude - search.longitude!);
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(this.toRad(search.latitude!)) * Math.cos(this.toRad(property.latitude)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance <= search.radius!;
      });
    }

    return results;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db.insert(properties).values(insertProperty).returning();
    return property;
  }

  async updateProperty(id: number, updateData: Partial<InsertProperty>): Promise<Property | undefined> {
    const [property] = await db
      .update(properties)
      .set(updateData)
      .where(eq(properties.id, id))
      .returning();
    return property;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db
      .delete(properties)
      .where(eq(properties.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Ricerche salvate
  async getSavedSearch(id: number): Promise<SavedSearch | undefined> {
    const [savedSearch] = await db.select().from(savedSearches).where(eq(savedSearches.id, id));
    return savedSearch;
  }

  async getSavedSearchesByUser(userId: number): Promise<SavedSearch[]> {
    return db.select().from(savedSearches).where(eq(savedSearches.userId, userId));
  }

  async createSavedSearch(savedSearch: InsertSavedSearch): Promise<SavedSearch> {
    const [result] = await db.insert(savedSearches).values(savedSearch).returning();
    return result;
  }

  async deleteSavedSearch(id: number): Promise<boolean> {
    const result = await db
      .delete(savedSearches)
      .where(eq(savedSearches.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Messaggi
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessagesByChat(propertyId: number, userId1: number, userId2: number): Promise<Message[]> {
    return db.select()
      .from(messages)
      .where(
        and(
          eq(messages.propertyId, propertyId),
          or(
            and(
              eq(messages.senderId, userId1),
              eq(messages.receiverId, userId2)
            ),
            and(
              eq(messages.senderId, userId2),
              eq(messages.receiverId, userId1)
            )
          )
        )
      )
      .orderBy(messages.createdAt);
  }

  async getChats(userId: number): Promise<{ propertyId: number, userId: number, propertyTitle: string, lastMessage: string, unreadCount: number }[]> {
    // Implementazione semplificata - nella versione reale dovrebbe usare subquery e aggregazioni
    // che non sono facilmente implementabili qui
    const allMessages = await db.select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      );

    const chatsMap = new Map<string, { propertyId: number, userId: number, messages: Message[] }>();
    
    for (const message of allMessages) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const chatKey = `${message.propertyId}-${otherUserId}`;
      
      if (!chatsMap.has(chatKey)) {
        chatsMap.set(chatKey, {
          propertyId: message.propertyId,
          userId: otherUserId,
          messages: []
        });
      }
      
      chatsMap.get(chatKey)!.messages.push(message);
    }
    
    const results = [];
    
    for (const [_, chat] of Array.from(chatsMap.entries())) {
      // Ordina i messaggi per data
      chat.messages.sort((a: Message, b: Message) => a.createdAt.getTime() - b.createdAt.getTime());
      
      const lastMessage = chat.messages[chat.messages.length - 1];
      const unreadCount = chat.messages.filter((m: Message) => 
        m.senderId !== userId && !m.isRead
      ).length;
      
      const property = await this.getProperty(chat.propertyId);
      if (!property) continue;
      
      results.push({
        propertyId: chat.propertyId,
        userId: chat.userId,
        propertyTitle: property.title,
        lastMessage: lastMessage.content,
        unreadCount
      });
    }
    
    return results;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [result] = await db.insert(messages).values(message).returning();
    return result;
  }

  async markMessagesAsRead(propertyId: number, senderId: number, receiverId: number): Promise<boolean> {
    const result = await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.propertyId, propertyId),
          eq(messages.senderId, senderId),
          eq(messages.receiverId, receiverId),
          eq(messages.isRead, false)
        )
      );
    return (result.rowCount ?? 0) > 0;
  }

  // Recensioni
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async getReviewsByProperty(propertyId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.propertyId, propertyId));
  }

  async getUserReviewForProperty(userId: number, propertyId: number): Promise<Review | undefined> {
    const [review] = await db.select()
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          eq(reviews.propertyId, propertyId)
        )
      );
    return review;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [result] = await db.insert(reviews).values(review).returning();
    return result;
  }

  async updateReview(id: number, updateData: Partial<Omit<Review, "id" | "createdAt">>): Promise<Review | undefined> {
    const [review] = await db
      .update(reviews)
      .set(updateData)
      .where(eq(reviews.id, id))
      .returning();
    return review;
  }

  async deleteReview(id: number): Promise<boolean> {
    const result = await db
      .delete(reviews)
      .where(eq(reviews.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Voti Recensioni
  async getUserVoteForReview(userId: number, reviewId: number): Promise<ReviewVote | undefined> {
    const [vote] = await db.select()
      .from(reviewVotes)
      .where(
        and(
          eq(reviewVotes.userId, userId),
          eq(reviewVotes.reviewId, reviewId)
        )
      );
    return vote;
  }

  async createReviewVote(vote: InsertReviewVote): Promise<ReviewVote> {
    const [result] = await db.insert(reviewVotes).values(vote).returning();
    return result;
  }

  async updateReviewVote(id: number, updateData: Partial<Omit<ReviewVote, "id" | "createdAt">>): Promise<ReviewVote | undefined> {
    const [vote] = await db
      .update(reviewVotes)
      .set(updateData)
      .where(eq(reviewVotes.id, id))
      .returning();
    return vote;
  }

  // Segnalazioni Recensioni
  async getUserReportForReview(userId: number, reviewId: number): Promise<ReviewReport | undefined> {
    const [report] = await db.select()
      .from(reviewReports)
      .where(
        and(
          eq(reviewReports.userId, userId),
          eq(reviewReports.reviewId, reviewId)
        )
      );
    return report;
  }

  async createReviewReport(report: InsertReviewReport): Promise<ReviewReport> {
    const [result] = await db.insert(reviewReports).values(report).returning();
    return result;
  }

  async getReviewReports(status?: string): Promise<ReviewReport[]> {
    if (status) {
      return db.select()
        .from(reviewReports)
        .where(eq(reviewReports.status, status));
    }
    
    return db.select().from(reviewReports);
  }

  async updateReviewReport(id: number, updateData: Partial<Omit<ReviewReport, "id" | "createdAt">>): Promise<ReviewReport | undefined> {
    const [report] = await db
      .update(reviewReports)
      .set(updateData)
      .where(eq(reviewReports.id, id))
      .returning();
    return report;
  }

  // Documenti
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getDocumentsByProperty(propertyId: number): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.propertyId, propertyId));
  }

  async getDocumentsByUser(userId: number, role: 'uploader' | 'signer' = 'uploader'): Promise<Document[]> {
    if (role === 'uploader') {
      return db.select().from(documents).where(eq(documents.uploaderId, userId));
    } else {
      // Per i firmatari, dobbiamo unire con la tabella signatures
      const signedDocIds = await db.select({ docId: signatures.documentId })
        .from(signatures)
        .where(eq(signatures.userId, userId));
      
      if (signedDocIds.length === 0) return [];
      
      return db.select()
        .from(documents)
        .where(inArray(documents.id, signedDocIds.map(d => d.docId)));
    }
  }

  async getTemplateDocuments(): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.isTemplate, true));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [result] = await db.insert(documents).values(document).returning();
    return result;
  }

  async updateDocument(id: number, updateData: Partial<Omit<Document, "id" | "createdAt">>): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, id))
      .returning();
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db
      .delete(documents)
      .where(eq(documents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Firme
  async getSignature(id: number): Promise<Signature | undefined> {
    const [signature] = await db.select().from(signatures).where(eq(signatures.id, id));
    return signature;
  }

  async getSignaturesByDocument(documentId: number): Promise<Signature[]> {
    return db.select().from(signatures).where(eq(signatures.documentId, documentId));
  }

  async getUserSignatureForDocument(userId: number, documentId: number): Promise<Signature | undefined> {
    const [signature] = await db.select()
      .from(signatures)
      .where(
        and(
          eq(signatures.userId, userId),
          eq(signatures.documentId, documentId)
        )
      );
    return signature;
  }

  async createSignature(signature: InsertSignature): Promise<Signature> {
    const [result] = await db.insert(signatures).values(signature).returning();
    return result;
  }

  // Interazioni utente
  async getUserInteraction(id: number): Promise<UserInteraction | undefined> {
    const [interaction] = await db.select().from(userInteractions).where(eq(userInteractions.id, id));
    return interaction;
  }

  async getUserInteractionsByUser(userId: number): Promise<UserInteraction[]> {
    return db.select().from(userInteractions).where(eq(userInteractions.userId, userId));
  }

  async getUserInteractionsByProperty(propertyId: number): Promise<UserInteraction[]> {
    return db.select().from(userInteractions).where(eq(userInteractions.propertyId, propertyId));
  }

  async createUserInteraction(interaction: InsertUserInteraction): Promise<UserInteraction> {
    const [result] = await db.insert(userInteractions).values(interaction).returning();
    return result;
  }

  async getSimilarProperties(propertyId: number, limit: number = 6): Promise<Property[]> {
    try {
      // Ottieni la proprietà di riferimento
      const property = await this.getProperty(propertyId);
      if (!property) {
        return [];
      }

      // Trova proprietà simili basate su città, tipo e prezzo simile
      return db.select()
        .from(properties)
        .where(and(
          eq(properties.isActive, true),
          sql`${properties.id} != ${propertyId}`, // Escludi la proprietà corrente
          eq(properties.city, property.city),
          sql`${properties.propertyType.name} = ${property.propertyType}`,
          // Prezzo nel range ±30%
          gte(properties.price, property.price * 0.7),
          lte(properties.price, property.price * 1.3)
        ))
        .orderBy(desc(properties.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Errore nel recupero delle proprietà simili:', error);
      return [];
    }
  }

  async getRecommendedProperties(userId: number, limit: number = 10): Promise<Property[]> {
    try {
      // Ottieni le interazioni dell'utente
      const userInteractions = await this.getUserInteractionsByUser(userId);
      
      // Se l'utente non ha interazioni, restituisci le proprietà più recenti
      if (userInteractions.length === 0) {
        return db.select()
          .from(properties)
          .where(eq(properties.isActive, true))
          .orderBy(desc(properties.createdAt))
          .limit(limit);
      }
      
      // Altrimenti, implementiamo una logica di raccomandazione semplice:
      // 1. Ottieni i tipi di proprietà con cui l'utente ha interagito maggiormente
      const propertyTypeMap = new Map<string, number>();
      
      for (const interaction of userInteractions) {
        try {
          const property = await this.getProperty(interaction.propertyId);
          if (property) {
            const currentCount = propertyTypeMap.get(property.propertyType) || 0;
            propertyTypeMap.set(property.propertyType, currentCount + 1);
          }
        } catch (error) {
          console.error('Errore nel recupero della proprietà:', error);
        }
      }
      
      // Ottieni il tipo di proprietà più frequente
      let mostFrequentType = '';
      let highestCount = 0;
      
      for (const [type, count] of Array.from(propertyTypeMap.entries())) {
        if (count > highestCount) {
          highestCount = count;
          mostFrequentType = type;
        }
      }
      
      // 2. Ottieni proprietà simili basate sul tipo più frequente
      if (mostFrequentType) {
        return db.select()
          .from(properties)
          .where(and(
            eq(properties.isActive, true),
            sql`${properties.propertyType.name} = ${mostFrequentType}`
          ))
          .orderBy(desc(properties.createdAt))
          .limit(limit);
      }
      
      // Fallback alle proprietà più recenti
      return db.select()
        .from(properties)
        .where(eq(properties.isActive, true))
        .orderBy(desc(properties.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Errore nel recupero delle proprietà raccomandate:', error);
      // Fallback a un risultato vuoto in caso di errore
      return [];
    }
  }
}