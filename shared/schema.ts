import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, jsonb, real, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum per i tipi di proprietà
export const propertyTypeEnum = pgEnum('property_type', ['stanza_singola', 'stanza_doppia', 'monolocale', 'bilocale', 'altro']);

// Enum per i piani di abbonamento
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['single', 'standard', 'premium']);

// Enum per i tipi di interazione utente
export const interactionTypeEnum = pgEnum('interaction_type', ['view', 'save', 'contact']);

// Enum per i paesi europei
export const countryEnum = pgEnum('country', [
  'AT', // Austria
  'BE', // Belgio
  'BG', // Bulgaria
  'CY', // Cipro
  'HR', // Croazia
  'DK', // Danimarca
  'EE', // Estonia
  'FI', // Finlandia
  'FR', // Francia
  'DE', // Germania
  'GR', // Grecia
  'IE', // Irlanda
  'IT', // Italia
  'LV', // Lettonia
  'LT', // Lituania
  'LU', // Lussemburgo
  'MT', // Malta
  'NL', // Paesi Bassi
  'PL', // Polonia
  'PT', // Portogallo
  'CZ', // Repubblica Ceca
  'RO', // Romania
  'SK', // Slovacchia
  'SI', // Slovenia
  'ES', // Spagna
  'SE', // Svezia
  'HU', // Ungheria
  // Altri paesi europei non UE
  'AL', // Albania
  'AD', // Andorra
  'BY', // Bielorussia
  'BA', // Bosnia ed Erzegovina
  'VA', // Città del Vaticano
  'IS', // Islanda
  'LI', // Liechtenstein
  'MK', // Macedonia del Nord
  'MD', // Moldova
  'MC', // Monaco
  'ME', // Montenegro
  'NO', // Norvegia
  'UK', // Regno Unito
  'RS', // Serbia
  'CH', // Svizzera
  'UA', // Ucraina
]);

// Tabella utenti
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  name: text("name"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  firebaseUid: text("firebase_uid").unique(),
  profileImage: text("profile_image"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionPlan: subscriptionPlanEnum("subscription_plan"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  usedFreeListing: boolean("used_free_listing").default(false),
  remainingListings: integer("remaining_listings").default(0),
});

// Tabella proprietà/annunci
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  price: integer("price").notNull(), // prezzo in centesimi
  country: countryEnum("country").notNull().default("IT"),
  city: text("city").notNull(),
  address: text("address").notNull(),
  zone: text("zone"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  squareMeters: integer("square_meters"),
  bathrooms: integer("bathrooms").default(1),
  bedrooms: integer("bedrooms").default(1),
  photos: text("photos").array(),
  features: jsonb("features"), // wifi, aria condizionata, ecc.
  availableFrom: timestamp("available_from"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isFurnished: boolean("is_furnished").default(false),
  allowsPets: boolean("allows_pets").default(false),
  internetIncluded: boolean("internet_included").default(false),
});

// Tabella ricerche salvate
export const savedSearches = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  searchCriteria: jsonb("search_criteria").notNull(), // criteri di ricerca salvati
  createdAt: timestamp("created_at").defaultNow().notNull(),
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
});

// Tabella messaggi della chat
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
});

// Tabella recensioni per proprietà
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  rating: integer("rating").notNull(), // Rating da 1 a 5 stelle (validato nell'API)
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  ownerResponse: text("owner_response"),
  helpful: integer("helpful_count").default(0),
  unhelpful: integer("unhelpful_count").default(0),
});

// Tabella recensioni per inserzionisti
export const userReviews = pgTable("user_reviews", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id).notNull(), // Chi scrive la recensione
  inserzionistId: integer("inserzionista_id").references(() => users.id).notNull(), // Chi riceve la recensione
  rating: integer("rating").notNull(), // Rating da 1 a 5 stelle
  comment: text("comment"), // Commento facoltativo
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  interaction: boolean("has_interaction").default(false).notNull(), // Indica se c'è stata un'interazione tra utenti
});

// Tabella segnalazioni recensioni
export const reviewReports = pgTable("review_reports", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => reviews.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").default("pending").notNull(), // pending, resolved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  moderatorNotes: text("moderator_notes"),
});

// Tabella voti utilità recensioni
export const reviewVotes = pgTable("review_votes", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => reviews.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  isHelpful: boolean("is_helpful").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella documenti
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  uploaderId: integer("uploader_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(), // Tipo MIME del file (es. application/pdf)
  fileUrl: text("file_url").notNull(), // URL dove il file è memorizzato
  description: text("description"),
  category: text("category").default("contract").notNull(), // contract, agreement, other
  isTemplate: boolean("is_template").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  expiresAt: timestamp("expires_at"),
});

// Tabella firme elettroniche
export const signatures = pgTable("signatures", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  signatureUrl: text("signature_url").notNull(), // URL dell'immagine della firma
  signedAt: timestamp("signed_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Tabella dei preferiti
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella interazioni utente per raccomandazioni
export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  interactionType: interactionTypeEnum("interaction_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella città per Italia e Spagna
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: countryEnum("country").notNull(),
  province: text("province"),
  population: integer("population"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  isPopular: boolean("is_popular").default(false),
});

// Schema di inserimento per utenti
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  emailVerified: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  subscriptionPlan: true,
  subscriptionExpiresAt: true,
  firebaseUid: true,
  profileImage: true
});

// Schema di inserimento per proprietà
export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  isActive: true,
});

// Schema di inserimento per ricerche salvate
export const insertSavedSearchSchema = createInsertSchema(savedSearches).omit({
  id: true,
  createdAt: true,
});

// Schema di inserimento per messaggi
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

// Schema di inserimento per recensioni con validazione rating
export const insertReviewSchema = createInsertSchema(reviews)
  .omit({ id: true, createdAt: true, ownerResponse: true, helpful: true, unhelpful: true })
  .extend({
    rating: z.number().min(1).max(5),
  });

// Schema di inserimento per recensioni utenti
export const insertUserReviewSchema = createInsertSchema(userReviews)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    rating: z.number().min(1).max(5),
  });

// Schema per le risposte ai recensioni 
export const reviewResponseSchema = z.object({
  reviewId: z.number(),
  response: z.string().min(1).max(500),
});

// Schema per le segnalazioni 
export const insertReviewReportSchema = createInsertSchema(reviewReports)
  .omit({ 
    id: true, 
    createdAt: true, 
    status: true, 
    resolvedAt: true, 
    moderatorNotes: true 
  });

// Schema per i voti di utilità
export const insertReviewVoteSchema = createInsertSchema(reviewVotes)
  .omit({
    id: true,
    createdAt: true
  });

// Schema per i documenti
export const insertDocumentSchema = createInsertSchema(documents)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Schema per le firme
export const insertSignatureSchema = createInsertSchema(signatures)
  .omit({
    id: true,
    signedAt: true,
    ipAddress: true,
    userAgent: true
  });

// Schema per le interazioni utente
export const insertUserInteractionSchema = createInsertSchema(userInteractions)
  .omit({
    id: true,
    createdAt: true
  });

// Schema per inserimento città
export const insertCitySchema = createInsertSchema(cities)
  .omit({
    id: true
  });

// Schema per la ricerca di proprietà
export const propertySearchSchema = z.object({
  country: z.enum(countryEnum.enumValues).optional(),
  city: z.string().optional(),
  propertyType: z.enum(propertyTypeEnum.enumValues).optional(),
  maxPrice: z.number().optional(),
  minPrice: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  features: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().optional(),
  isFurnished: z.boolean().optional(),
  allowsPets: z.boolean().optional(),
  internetIncluded: z.boolean().optional(),
});

// Schema per i preferiti
export const insertFavoriteSchema = createInsertSchema(favorites)
  .omit({
    id: true,
    createdAt: true
  });

// Tipi derivati
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;
export type SavedSearch = typeof savedSearches.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertUserReview = z.infer<typeof insertUserReviewSchema>;
export type UserReview = typeof userReviews.$inferSelect;

export type InsertReviewReport = z.infer<typeof insertReviewReportSchema>;
export type ReviewReport = typeof reviewReports.$inferSelect;

export type InsertReviewVote = z.infer<typeof insertReviewVoteSchema>;
export type ReviewVote = typeof reviewVotes.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertSignature = z.infer<typeof insertSignatureSchema>;
export type Signature = typeof signatures.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export type InsertUserInteraction = z.infer<typeof insertUserInteractionSchema>;
export type UserInteraction = typeof userInteractions.$inferSelect;

export type InsertCity = z.infer<typeof insertCitySchema>;
export type City = typeof cities.$inferSelect;

export type PropertySearch = z.infer<typeof propertySearchSchema>;
