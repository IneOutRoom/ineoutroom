import { 
  users, properties, savedSearches, messages, reviews, reviewVotes, reviewReports,
  documents, signatures, userInteractions, cities,
  reviewResponseSchema,
  type User, type InsertUser, type Property, type InsertProperty, 
  type SavedSearch, type InsertSavedSearch, type PropertySearch, 
  type Message, type InsertMessage, type Review, type InsertReview, 
  type ReviewVote, type InsertReviewVote, type ReviewReport, type InsertReviewReport,
  type Document, type InsertDocument, type Signature, type InsertSignature,
  type UserInteraction, type InsertUserInteraction, type City
} from "@shared/schema";
import { eq, and, gte, lte, like, or, inArray } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interfaccia dello storage
export interface IStorage {
  // Utenti
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: number, info: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User>;

  // Paesi e Città
  getCountries(): Promise<{code: string, name: string}[]>;
  getCities(country?: string): Promise<City[]>;
  
  // Proprietà
  getProperty(id: number): Promise<Property | undefined>;
  getPropertiesByUser(userId: number): Promise<Property[]>;
  searchProperties(search: PropertySearch): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;

  // Ricerche salvate
  getSavedSearch(id: number): Promise<SavedSearch | undefined>;
  getSavedSearchesByUser(userId: number): Promise<SavedSearch[]>;
  createSavedSearch(savedSearch: InsertSavedSearch): Promise<SavedSearch>;
  deleteSavedSearch(id: number): Promise<boolean>;
  
  // Messaggi
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByChat(propertyId: number, userId1: number, userId2: number): Promise<Message[]>;
  getChats(userId: number): Promise<{propertyId: number, userId: number, propertyTitle: string, lastMessage: string, unreadCount: number}[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(propertyId: number, senderId: number, receiverId: number): Promise<boolean>;
  
  // Recensioni
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByProperty(propertyId: number): Promise<Review[]>;
  getUserReviewForProperty(userId: number, propertyId: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<Omit<Review, "id" | "createdAt">>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  
  // Voti Recensioni
  getUserVoteForReview(userId: number, reviewId: number): Promise<ReviewVote | undefined>;
  createReviewVote(vote: InsertReviewVote): Promise<ReviewVote>;
  updateReviewVote(id: number, vote: Partial<Omit<ReviewVote, "id" | "createdAt">>): Promise<ReviewVote | undefined>;
  
  // Segnalazioni Recensioni
  getUserReportForReview(userId: number, reviewId: number): Promise<ReviewReport | undefined>;
  createReviewReport(report: InsertReviewReport): Promise<ReviewReport>;
  getReviewReports(status?: string): Promise<ReviewReport[]>;
  updateReviewReport(id: number, report: Partial<Omit<ReviewReport, "id" | "createdAt">>): Promise<ReviewReport | undefined>;
  
  // Documenti
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByProperty(propertyId: number): Promise<Document[]>;
  getDocumentsByUser(userId: number, role?: 'uploader' | 'signer'): Promise<Document[]>;
  getTemplateDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<Omit<Document, "id" | "createdAt">>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Firme
  getSignature(id: number): Promise<Signature | undefined>;
  getSignaturesByDocument(documentId: number): Promise<Signature[]>;
  getUserSignatureForDocument(userId: number, documentId: number): Promise<Signature | undefined>;
  createSignature(signature: InsertSignature): Promise<Signature>;
  
  // Interazioni utente
  getUserInteraction(id: number): Promise<UserInteraction | undefined>;
  getUserInteractionsByUser(userId: number): Promise<UserInteraction[]>;
  getUserInteractionsByProperty(propertyId: number): Promise<UserInteraction[]>;
  createUserInteraction(interaction: InsertUserInteraction): Promise<UserInteraction>;
  getRecommendedProperties(userId: number, limit?: number): Promise<Property[]>;
  
  // Sessione
  sessionStore: session.Store;
}

// Implementazione in memoria
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private propertiesMap: Map<number, Property>;
  private savedSearchesMap: Map<number, SavedSearch>;
  private messagesMap: Map<number, Message>;
  private reviewsMap: Map<number, Review>;
  private reviewVotesMap: Map<number, ReviewVote>;
  private reviewReportsMap: Map<number, ReviewReport>;
  private documentsMap: Map<number, Document>;
  private signaturesMap: Map<number, Signature>;
  private userInteractionsMap: Map<number, UserInteraction>;
  private citiesMap: Map<number, City>;
  private currentUserId: number;
  private currentPropertyId: number;
  private currentSavedSearchId: number;
  private currentMessageId: number;
  private currentReviewId: number;
  private currentReviewVoteId: number;
  private currentReviewReportId: number;
  private currentDocumentId: number;
  private currentSignatureId: number;
  private currentUserInteractionId: number;
  private currentCityId: number;
  sessionStore: session.Store;

  constructor() {
    this.usersMap = new Map();
    this.propertiesMap = new Map();
    this.savedSearchesMap = new Map();
    this.messagesMap = new Map();
    this.reviewsMap = new Map();
    this.reviewVotesMap = new Map();
    this.reviewReportsMap = new Map();
    this.documentsMap = new Map();
    this.signaturesMap = new Map();
    this.userInteractionsMap = new Map();
    this.citiesMap = new Map();
    this.currentUserId = 1;
    this.currentPropertyId = 1;
    this.currentSavedSearchId = 1;
    this.currentMessageId = 1;
    this.currentReviewId = 1;
    this.currentReviewVoteId = 1;
    this.currentReviewReportId = 1;
    this.currentDocumentId = 1;
    this.currentSignatureId = 1;
    this.currentUserInteractionId = 1;
    this.currentCityId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
  }
  
  // Paesi e Città
  async getCountries(): Promise<{code: string, name: string}[]> {
    // Lista statica dei paesi europei in italiano
    return [
      {code: 'AT', name: 'Austria'},
      {code: 'BE', name: 'Belgio'},
      {code: 'BG', name: 'Bulgaria'},
      {code: 'CY', name: 'Cipro'},
      {code: 'HR', name: 'Croazia'},
      {code: 'DK', name: 'Danimarca'},
      {code: 'EE', name: 'Estonia'},
      {code: 'FI', name: 'Finlandia'},
      {code: 'FR', name: 'Francia'},
      {code: 'DE', name: 'Germania'},
      {code: 'GR', name: 'Grecia'},
      {code: 'IE', name: 'Irlanda'},
      {code: 'IT', name: 'Italia'},
      {code: 'LV', name: 'Lettonia'},
      {code: 'LT', name: 'Lituania'},
      {code: 'LU', name: 'Lussemburgo'},
      {code: 'MT', name: 'Malta'},
      {code: 'NL', name: 'Paesi Bassi'},
      {code: 'PL', name: 'Polonia'},
      {code: 'PT', name: 'Portogallo'},
      {code: 'CZ', name: 'Repubblica Ceca'},
      {code: 'RO', name: 'Romania'},
      {code: 'SK', name: 'Slovacchia'},
      {code: 'SI', name: 'Slovenia'},
      {code: 'ES', name: 'Spagna'},
      {code: 'SE', name: 'Svezia'},
      {code: 'HU', name: 'Ungheria'},
      {code: 'AL', name: 'Albania'},
      {code: 'AD', name: 'Andorra'},
      {code: 'BY', name: 'Bielorussia'},
      {code: 'BA', name: 'Bosnia ed Erzegovina'},
      {code: 'VA', name: 'Città del Vaticano'},
      {code: 'IS', name: 'Islanda'},
      {code: 'LI', name: 'Liechtenstein'},
      {code: 'MK', name: 'Macedonia del Nord'},
      {code: 'MD', name: 'Moldova'},
      {code: 'MC', name: 'Monaco'},
      {code: 'ME', name: 'Montenegro'},
      {code: 'NO', name: 'Norvegia'},
      {code: 'UK', name: 'Regno Unito'},
      {code: 'RS', name: 'Serbia'},
      {code: 'CH', name: 'Svizzera'},
      {code: 'UA', name: 'Ucraina'}
    ].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  async getCities(country?: string): Promise<City[]> {
    const cities = Array.from(this.citiesMap.values());
    
    if (country) {
      return cities.filter(city => city.country === country);
    }
    
    return cities;
  }

  // Utenti
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionPlan: null,
      subscriptionExpiresAt: null
    };
    this.usersMap.set(id, user);
    return user;
  }

  async updateStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    const updatedUser = { ...user, stripeCustomerId: customerId };
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(userId: number, info: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      stripeCustomerId: info.stripeCustomerId,
      stripeSubscriptionId: info.stripeSubscriptionId,
      subscriptionPlan: 'standard' as const, // Default to standard plan
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }

  // Proprietà
  async getProperty(id: number): Promise<Property | undefined> {
    return this.propertiesMap.get(id);
  }

  async getPropertiesByUser(userId: number): Promise<Property[]> {
    return Array.from(this.propertiesMap.values()).filter(
      (property) => property.userId === userId,
    );
  }

  async searchProperties(search: PropertySearch): Promise<Property[]> {
    let results = Array.from(this.propertiesMap.values()).filter(
      (property) => property.isActive
    );

    // Filtra per città
    if (search.city) {
      results = results.filter(property => property.city.toLowerCase().includes(search.city!.toLowerCase()));
    }

    // Filtra per tipo di proprietà
    if (search.propertyType) {
      results = results.filter(property => property.propertyType === search.propertyType);
    }

    // Filtra per prezzo
    if (search.minPrice) {
      results = results.filter(property => property.price >= search.minPrice! * 100);
    }
    if (search.maxPrice) {
      results = results.filter(property => property.price <= search.maxPrice! * 100);
    }

    // Filtra per posizione (geolocalizzazione)
    if (search.latitude && search.longitude && search.radius) {
      results = results.filter(property => {
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

    // Ritorno i risultati
    return results;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const now = new Date();
    const property: Property = {
      ...insertProperty,
      id,
      createdAt: now,
      isActive: true
    };
    this.propertiesMap.set(id, property);
    return property;
  }

  async updateProperty(id: number, updateData: Partial<InsertProperty>): Promise<Property | undefined> {
    const property = await this.getProperty(id);
    if (!property) {
      return undefined;
    }

    const updatedProperty = { ...property, ...updateData };
    this.propertiesMap.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.propertiesMap.delete(id);
  }

  // Ricerche salvate
  async getSavedSearch(id: number): Promise<SavedSearch | undefined> {
    return this.savedSearchesMap.get(id);
  }

  async getSavedSearchesByUser(userId: number): Promise<SavedSearch[]> {
    return Array.from(this.savedSearchesMap.values()).filter(
      (savedSearch) => savedSearch.userId === userId,
    );
  }

  async createSavedSearch(insertSavedSearch: InsertSavedSearch): Promise<SavedSearch> {
    const id = this.currentSavedSearchId++;
    const now = new Date();
    const savedSearch: SavedSearch = {
      ...insertSavedSearch,
      id,
      createdAt: now,
      notificationsEnabled: insertSavedSearch.notificationsEnabled || false
    };
    this.savedSearchesMap.set(id, savedSearch);
    return savedSearch;
  }

  async deleteSavedSearch(id: number): Promise<boolean> {
    return this.savedSearchesMap.delete(id);
  }
  
  // Messaggi
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messagesMap.get(id);
  }
  
  async getMessagesByChat(propertyId: number, userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messagesMap.values()).filter(
      (message) => 
        message.propertyId === propertyId && 
        ((message.senderId === userId1 && message.receiverId === userId2) || 
         (message.senderId === userId2 && message.receiverId === userId1))
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async getChats(userId: number): Promise<{propertyId: number, userId: number, propertyTitle: string, lastMessage: string, unreadCount: number}[]> {
    // Trova tutti i messaggi in cui l'utente è coinvolto
    const userMessages = Array.from(this.messagesMap.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
    
    // Raggruppali per conversazione (propertyId + altro utente)
    const chatMap = new Map<string, {
      propertyId: number,
      userId: number, 
      messages: Message[],
      propertyTitle: string
    }>();
    
    for (const message of userMessages) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const chatKey = `${message.propertyId}-${otherUserId}`;
      
      if (!chatMap.has(chatKey)) {
        const property = this.propertiesMap.get(message.propertyId);
        chatMap.set(chatKey, {
          propertyId: message.propertyId,
          userId: otherUserId,
          messages: [],
          propertyTitle: property ? property.title : 'Proprietà sconosciuta'
        });
      }
      
      chatMap.get(chatKey)?.messages.push(message);
    }
    
    // Prepara il risultato con l'ultimo messaggio e conteggio non letti
    return Array.from(chatMap.values()).map(chat => {
      // Ordina i messaggi per data
      chat.messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      // Conta i messaggi non letti inviati all'utente corrente
      const unreadCount = chat.messages.filter(
        m => m.receiverId === userId && !m.isRead
      ).length;
      
      return {
        propertyId: chat.propertyId,
        userId: chat.userId,
        propertyTitle: chat.propertyTitle,
        lastMessage: chat.messages[0]?.content || '',
        unreadCount
      };
    }).sort((a, b) => b.unreadCount - a.unreadCount);
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: now,
      isRead: false
    };
    this.messagesMap.set(id, message);
    return message;
  }
  
  async markMessagesAsRead(propertyId: number, senderId: number, receiverId: number): Promise<boolean> {
    let updated = false;
    
    // Trova tutti i messaggi da leggere
    const messages = Array.from(this.messagesMap.values()).filter(
      (message) => 
        message.propertyId === propertyId && 
        message.senderId === senderId && 
        message.receiverId === receiverId &&
        !message.isRead
    );
    
    // Segna come letti
    for (const message of messages) {
      const updatedMessage = { ...message, isRead: true };
      this.messagesMap.set(message.id, updatedMessage);
      updated = true;
    }
    
    return updated;
  }

  // Recensioni
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviewsMap.get(id);
  }

  async getReviewsByProperty(propertyId: number): Promise<Review[]> {
    return Array.from(this.reviewsMap.values()).filter(
      (review) => review.propertyId === propertyId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Più recenti prima
  }

  async getUserReviewForProperty(userId: number, propertyId: number): Promise<Review | undefined> {
    return Array.from(this.reviewsMap.values()).find(
      (review) => review.userId === userId && review.propertyId === propertyId
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    // Verifica se l'utente ha già recensito questa proprietà
    const existingReview = await this.getUserReviewForProperty(insertReview.userId, insertReview.propertyId);
    if (existingReview) {
      throw new Error('Hai già inserito una recensione per questa proprietà');
    }

    // Verifica che il rating sia compreso tra 1 e 5
    if (insertReview.rating < 1 || insertReview.rating > 5) {
      throw new Error('Il rating deve essere compreso tra 1 e 5 stelle');
    }

    const id = this.currentReviewId++;
    const now = new Date();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: now,
      ownerResponse: null,
      helpful: 0,
      unhelpful: 0,
      comment: insertReview.comment || null
    };
    this.reviewsMap.set(id, review);
    return review;
  }

  async updateReview(id: number, updateData: Partial<InsertReview>): Promise<Review | undefined> {
    const review = await this.getReview(id);
    if (!review) {
      return undefined;
    }

    const updatedReview = { ...review, ...updateData };
    this.reviewsMap.set(id, updatedReview);
    return updatedReview;
  }

  async deleteReview(id: number): Promise<boolean> {
    return this.reviewsMap.delete(id);
  }

  // Voti Recensioni
  async getUserVoteForReview(userId: number, reviewId: number): Promise<ReviewVote | undefined> {
    return Array.from(this.reviewVotesMap.values()).find(
      (vote) => vote.userId === userId && vote.reviewId === reviewId
    );
  }

  async createReviewVote(insertVote: InsertReviewVote): Promise<ReviewVote> {
    // Verifica se l'utente ha già votato questa recensione
    const existingVote = await this.getUserVoteForReview(insertVote.userId, insertVote.reviewId);
    if (existingVote) {
      throw new Error('Hai già votato questa recensione');
    }

    const id = this.currentReviewVoteId++;
    const now = new Date();
    const vote: ReviewVote = {
      ...insertVote,
      id,
      createdAt: now
    };
    this.reviewVotesMap.set(id, vote);

    // Aggiorna il conteggio dei voti sulla recensione
    const review = await this.getReview(insertVote.reviewId);
    if (review) {
      if (insertVote.isHelpful) {
        const updatedReview = { 
          ...review, 
          helpful: (review.helpful || 0) + 1 
        };
        this.reviewsMap.set(review.id, updatedReview);
      } else {
        const updatedReview = { 
          ...review, 
          unhelpful: (review.unhelpful || 0) + 1 
        };
        this.reviewsMap.set(review.id, updatedReview);
      }
    }
    
    return vote;
  }

  async updateReviewVote(id: number, updateData: Partial<Omit<ReviewVote, "id" | "createdAt">>): Promise<ReviewVote | undefined> {
    const vote = await this.reviewVotesMap.get(id);
    if (!vote) {
      return undefined;
    }

    const updatedVote = { ...vote, ...updateData };
    this.reviewVotesMap.set(id, updatedVote);
    return updatedVote;
  }

  // Segnalazioni Recensioni
  async getUserReportForReview(userId: number, reviewId: number): Promise<ReviewReport | undefined> {
    return Array.from(this.reviewReportsMap.values()).find(
      (report) => report.userId === userId && report.reviewId === reviewId
    );
  }

  async createReviewReport(insertReport: InsertReviewReport): Promise<ReviewReport> {
    // Verifica se l'utente ha già segnalato questa recensione
    const existingReport = await this.getUserReportForReview(insertReport.userId, insertReport.reviewId);
    if (existingReport) {
      throw new Error('Hai già segnalato questa recensione');
    }

    const id = this.currentReviewReportId++;
    const now = new Date();
    const report: ReviewReport = {
      ...insertReport,
      id,
      createdAt: now,
      status: 'pending',
      resolvedAt: null,
      moderatorNotes: null,
      details: insertReport.details || null
    };
    this.reviewReportsMap.set(id, report);
    return report;
  }

  async getReviewReports(status?: string): Promise<ReviewReport[]> {
    let reports = Array.from(this.reviewReportsMap.values());
    
    if (status) {
      reports = reports.filter(report => report.status === status);
    }
    
    return reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateReviewReport(id: number, updateData: Partial<Omit<ReviewReport, "id" | "createdAt">>): Promise<ReviewReport | undefined> {
    const report = await this.reviewReportsMap.get(id);
    if (!report) {
      return undefined;
    }

    const updatedReport = { 
      ...report, 
      ...updateData,
      resolvedAt: (updateData.status === "resolved" || updateData.status === "rejected") 
        ? new Date() 
        : report.resolvedAt
    };
    
    this.reviewReportsMap.set(id, updatedReport);
    return updatedReport;
  }

  // Documenti
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documentsMap.get(id);
  }

  async getDocumentsByProperty(propertyId: number): Promise<Document[]> {
    return Array.from(this.documentsMap.values()).filter(
      (document) => document.propertyId === propertyId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Più recenti prima
  }

  async getDocumentsByUser(userId: number, role: 'uploader' | 'signer' = 'uploader'): Promise<Document[]> {
    if (role === 'uploader') {
      // Documenti caricati dall'utente
      return Array.from(this.documentsMap.values()).filter(
        (document) => document.uploaderId === userId
      ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      // Documenti per cui l'utente è un firmatario
      const userSignatures = Array.from(this.signaturesMap.values()).filter(
        (signature) => signature.userId === userId
      );
      
      const documentIds = new Set(userSignatures.map(s => s.documentId));
      
      return Array.from(this.documentsMap.values()).filter(
        (document) => documentIds.has(document.id)
      ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  async getTemplateDocuments(): Promise<Document[]> {
    return Array.from(this.documentsMap.values()).filter(
      (document) => document.isTemplate === true
    );
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const now = new Date();
    const document: Document = {
      ...insertDocument,
      id,
      createdAt: now,
      updatedAt: null,
      expiresAt: null
    };
    this.documentsMap.set(id, document);
    return document;
  }

  async updateDocument(id: number, updateData: Partial<Omit<Document, "id" | "createdAt">>): Promise<Document | undefined> {
    const document = await this.getDocument(id);
    if (!document) {
      return undefined;
    }

    const now = new Date();
    const updatedDocument = { 
      ...document, 
      ...updateData,
      updatedAt: now 
    };
    this.documentsMap.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documentsMap.delete(id);
  }

  // Firme
  async getSignature(id: number): Promise<Signature | undefined> {
    return this.signaturesMap.get(id);
  }

  async getSignaturesByDocument(documentId: number): Promise<Signature[]> {
    return Array.from(this.signaturesMap.values()).filter(
      (signature) => signature.documentId === documentId
    );
  }

  async getUserSignatureForDocument(userId: number, documentId: number): Promise<Signature | undefined> {
    return Array.from(this.signaturesMap.values()).find(
      (signature) => signature.userId === userId && signature.documentId === documentId
    );
  }

  async createSignature(insertSignature: InsertSignature): Promise<Signature> {
    // Verifica se l'utente ha già firmato questo documento
    const existingSignature = await this.getUserSignatureForDocument(
      insertSignature.userId, 
      insertSignature.documentId
    );
    
    if (existingSignature) {
      throw new Error('Hai già firmato questo documento');
    }

    const id = this.currentSignatureId++;
    const now = new Date();
    const signature: Signature = {
      ...insertSignature,
      id,
      signedAt: now,
      ipAddress: null,
      userAgent: null
    };
    this.signaturesMap.set(id, signature);
    
    return signature;
  }

  // Interazioni utente
  async getUserInteraction(id: number): Promise<UserInteraction | undefined> {
    return this.userInteractionsMap.get(id);
  }

  async getUserInteractionsByUser(userId: number): Promise<UserInteraction[]> {
    return Array.from(this.userInteractionsMap.values()).filter(
      (interaction) => interaction.userId === userId
    );
  }

  async getUserInteractionsByProperty(propertyId: number): Promise<UserInteraction[]> {
    return Array.from(this.userInteractionsMap.values()).filter(
      (interaction) => interaction.propertyId === propertyId
    );
  }

  async createUserInteraction(insertInteraction: InsertUserInteraction): Promise<UserInteraction> {
    // Verifica se esiste già un'interazione dello stesso tipo tra utente e proprietà
    const existingInteraction = Array.from(this.userInteractionsMap.values()).find(
      (interaction) => 
        interaction.userId === insertInteraction.userId && 
        interaction.propertyId === insertInteraction.propertyId &&
        interaction.interactionType === insertInteraction.interactionType
    );

    // Se esiste già, restituisci l'interazione esistente
    if (existingInteraction) {
      return existingInteraction;
    }

    // Altrimenti crea una nuova interazione
    const id = this.currentUserInteractionId++;
    const now = new Date();
    const interaction: UserInteraction = {
      ...insertInteraction,
      id,
      createdAt: now,
    };
    this.userInteractionsMap.set(id, interaction);
    return interaction;
  }

  async getSimilarProperties(propertyId: number, limit: number = 4): Promise<Property[]> {
    const sourceProperty = await this.getProperty(propertyId);
    if (!sourceProperty) return [];
    
    const similarityScore = (property: Property): number => {
      let score = 0;
      
      // Evita di mostrare la stessa proprietà
      if (property.id === propertyId) return -1;
      
      // Attiva solo
      if (!property.isActive) return -1;
      
      // Stesso tipo di proprietà
      if (property.propertyType === sourceProperty.propertyType) {
        score += 5;
      }
      
      // Stessa città
      if (property.city === sourceProperty.city) {
        score += 4;
      }
      
      // Prezzo simile (±20%)
      const lowerPrice = sourceProperty.price * 0.8;
      const upperPrice = sourceProperty.price * 1.2;
      if (property.price >= lowerPrice && property.price <= upperPrice) {
        score += 3;
        
        // Più il prezzo è vicino, più punti
        const priceDeviation = Math.abs(property.price - sourceProperty.price) / sourceProperty.price;
        if (priceDeviation < 0.05) { // Entro il 5%
          score += 2;
        } else if (priceDeviation < 0.1) { // Entro il 10%
          score += 1;
        }
      }
      
      // Bonus per stessa zona
      if (property.zone === sourceProperty.zone) {
        score += 3;
      }
      
      return score;
    };
    
    return Array.from(this.propertiesMap.values())
      .filter(property => property.id !== propertyId && property.isActive)
      .map(property => ({
        property,
        score: similarityScore(property)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.property)
      .slice(0, limit);
  }
  
  async getRecommendedProperties(userId: number, limit: number = 10): Promise<Property[]> {
    // Ottieni tutte le interazioni dell'utente
    const userInteractions = await this.getUserInteractionsByUser(userId);
    
    // Se l'utente non ha interazioni, restituisci le proprietà più recenti
    if (userInteractions.length === 0) {
      return Array.from(this.propertiesMap.values())
        .filter(property => property.isActive)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    }

    // Calcola le preferenze dell'utente basate sulle interazioni precedenti
    const userPreferences = {
      propertyTypes: new Map<string, number>(),  // Conteggio per tipo di proprietà
      cities: new Map<string, number>(),         // Conteggio per città
      priceRange: {
        min: Number.MAX_SAFE_INTEGER,
        max: 0,
        sum: 0,
        count: 0
      }
    };

    // Calcola punteggio per ciascuna interazione
    const interactionScores: {[key: string]: number} = {
      'view': 1,
      'save': 3,
      'contact': 5
    };

    // Funzione per calcolare il peso temporale (interazioni più recenti hanno più peso)
    const getTimeWeight = (date: Date): number => {
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      // Le interazioni più recenti hanno un peso maggiore (decadimento esponenziale)
      return Math.exp(-0.1 * diffDays);
    };

    // Raccogli i dati sulle proprietà con cui l'utente ha interagito
    const interactedPropertyIds = new Set<number>();
    
    for (const interaction of userInteractions) {
      const property = await this.getProperty(interaction.propertyId);
      if (!property) continue;
      
      interactedPropertyIds.add(property.id);
      
      // Aggiungi punteggio in base al tipo di interazione e al peso temporale
      const interactionScore = interactionScores[interaction.interactionType] || 1;
      const timeWeight = getTimeWeight(interaction.createdAt);
      const score = interactionScore * timeWeight;
      
      // Aggiorna preferenze per tipo di proprietà
      const currentTypeScore = userPreferences.propertyTypes.get(property.propertyType) || 0;
      userPreferences.propertyTypes.set(property.propertyType, currentTypeScore + score);
      
      // Aggiorna preferenze per città
      const currentCityScore = userPreferences.cities.get(property.city) || 0;
      userPreferences.cities.set(property.city, currentCityScore + score);
      
      // Aggiorna preferenze di prezzo (con peso temporale)
      userPreferences.priceRange.min = Math.min(userPreferences.priceRange.min, property.price);
      userPreferences.priceRange.max = Math.max(userPreferences.priceRange.max, property.price);
      userPreferences.priceRange.sum += property.price * timeWeight;
      userPreferences.priceRange.count += timeWeight;
    }
    
    // Calcola prezzo medio
    const avgPrice = userPreferences.priceRange.count > 0 
      ? userPreferences.priceRange.sum / userPreferences.priceRange.count 
      : 0;
    
    // Calcola margine di prezzo (±20% del prezzo medio)
    const priceLowerBound = avgPrice * 0.8;
    const priceUpperBound = avgPrice * 1.2;
    
    // Ottieni i tipi di proprietà e città preferiti (con più alto punteggio)
    const preferredTypes = Array.from(userPreferences.propertyTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 3);
    
    const preferredCities = Array.from(userPreferences.cities.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 3);
    
    // Funzione per calcolare il punteggio di somiglianza per ciascuna proprietà
    const calculateSimilarityScore = (property: Property): number => {
      let score = 0;
      
      // Non mostrare proprietà con cui l'utente ha già interagito
      if (interactedPropertyIds.has(property.id)) {
        return -1;
      }
      
      // Punteggio per tipo di proprietà
      if (preferredTypes.includes(property.propertyType)) {
        score += 5;
        
        // Bonus aggiuntivo se il tipo di proprietà è il primo nella lista delle preferenze
        if (preferredTypes[0] === property.propertyType) {
          score += 2;
        }
      }
      
      // Punteggio per città
      if (preferredCities.includes(property.city)) {
        score += 4;
        
        // Bonus aggiuntivo se la città è la prima nella lista delle preferenze
        if (preferredCities[0] === property.city) {
          score += 2;
        }
      }
      
      // Punteggio per intervallo di prezzo
      if (property.price >= priceLowerBound && property.price <= priceUpperBound) {
        score += 3;
        
        // Più il prezzo è vicino alla media, più alto è il punteggio
        const priceDeviation = Math.abs(property.price - avgPrice) / avgPrice;
        if (priceDeviation < 0.05) { // Deviazione minore del 5%
          score += 2;
        } else if (priceDeviation < 0.1) { // Deviazione minore del 10%
          score += 1;
        }
      }
      
      // Bonus per le proprietà più recenti
      const propertyAgeInDays = Math.floor((new Date().getTime() - property.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (propertyAgeInDays < 7) { // Meno di una settimana
        score += 2;
      } else if (propertyAgeInDays < 30) { // Meno di un mese
        score += 1;
      }
      
      return score;
    };
    
    // Filtra e ordina le proprietà in base al punteggio di somiglianza
    return Array.from(this.propertiesMap.values())
      .filter(property => property.isActive && !interactedPropertyIds.has(property.id))
      .map(property => ({
        property,
        score: calculateSimilarityScore(property)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.property)
      .slice(0, limit);
  }
}

// Importa e usa l'implementazione del database
import { DatabaseStorage } from './database-storage';
export const storage = new DatabaseStorage();