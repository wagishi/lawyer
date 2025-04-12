import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User tables for both lawyers and clients
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  // Personal Information
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  dateOfBirth: timestamp("date_of_birth"),
  
  // Account Information
  username: text("username").notNull().unique(),
  userType: text("user_type").notNull(), // "lawyer" or "client"
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  // Preferences and Settings
  preferredLanguage: text("preferred_language").default("en"),
  notificationPreferences: json("notification_preferences"),
  timezone: text("timezone"),
});

// Lawyer profile with 16-point format
export const lawyerProfiles = pgTable("lawyer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  specialization: text("specialization").notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  location: text("location").notNull(),
  lawSchool: text("law_school").notNull(),
  barNumber: text("bar_number").notNull(),
  biography: text("biography").notNull(),
  hourlyRate: integer("hourly_rate").notNull(),
  availability: text("availability").notNull(),
  languages: text("languages").array().notNull(),
  profilePicture: text("profile_picture"),
  expertise: text("expertise").array().notNull(),
  awards: text("awards").array(),
  publications: text("publications").array(),
  education: json("education").notNull(),
  professionalAssociations: text("professional_associations").array(),
});

// Client profile
export const clientProfiles = pgTable("client_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  phone: text("phone"),
  address: text("address"),
  preferredContactMethod: text("preferred_contact_method"),
});

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isShared: boolean("is_shared").default(false).notNull(),
  sharedWith: integer("shared_with").array(),
});

// Chat messages for AI consultation
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isFromAI: boolean("is_from_ai").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sessionId: text("session_id").notNull(),
});

// Legal resources
export const legalResources = pgTable("legal_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Legal news
export const legalNews = pgTable("legal_news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  publicationDate: timestamp("publication_date").defaultNow().notNull(),
  source: text("source"),
});

// Messages between users
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
});

// User sessions and usage tracking
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionStart: timestamp("session_start").defaultNow().notNull(),
  sessionEnd: timestamp("session_end"),
  ipAddress: text("ip_address"),
  deviceType: text("device_type"), // mobile, desktop, tablet
  browserInfo: text("browser_info"),
  userAgent: text("user_agent"),
  location: json("location"), // { country, city, etc. }
});

// Page visits and interactions
export const pageVisits = pgTable("page_visits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: integer("session_id").references(() => userSessions.id).notNull(),
  pagePath: text("page_path").notNull(),
  pageTitle: text("page_title"),
  visitTime: timestamp("visit_time").defaultNow().notNull(),
  timeSpent: integer("time_spent"), // in seconds
  referrer: text("referrer"),
  interactions: json("interactions"), // click patterns, scroll depth, etc.
});

// Transaction and payment data
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("USD").notNull(),
  status: text("status").notNull(), // pending, completed, failed, refunded
  paymentMethod: text("payment_method"), // credit_card, paypal, etc.
  paymentDetails: json("payment_details"), // masked card info, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  description: text("description"),
  metadata: json("metadata"),
});

// Cookies and tracking data
export const cookiesAndTracking = pgTable("cookies_and_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  deviceId: text("device_id"), // For tracking devices even when not logged in
  cookieId: text("cookie_id"),
  cookieType: text("cookie_type"), // essential, preference, statistics, marketing
  cookieValue: text("cookie_value"),
  cookieExpiry: timestamp("cookie_expiry"),
  trackingData: json("tracking_data"), // arbitrary tracking data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated"),
  consent: boolean("consent").default(false).notNull(), // Whether user consented to this cookie
  consentDate: timestamp("consent_date"),
});

// Consent management for users
export const userConsent = pgTable("user_consent", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  consentType: text("consent_type").notNull(), // privacy_policy, cookie_essential, cookie_marketing, etc.
  consentGiven: boolean("consent_given").default(false).notNull(),
  consentDate: timestamp("consent_date").defaultNow().notNull(),
  consentVersion: text("consent_version").notNull(), // Version of the document consented to
  consentMethod: text("consent_method"), // How consent was given (checkbox, explicit button, etc.)
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Create Zod schemas for insertion
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertLawyerProfileSchema = createInsertSchema(lawyerProfiles).omit({ id: true });
export const insertClientProfileSchema = createInsertSchema(clientProfiles).omit({ id: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertLegalResourceSchema = createInsertSchema(legalResources).omit({ id: true, createdAt: true });
export const insertLegalNewsSchema = createInsertSchema(legalNews).omit({ id: true, publicationDate: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isRead: true });
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ id: true, sessionStart: true });
export const insertPageVisitSchema = createInsertSchema(pageVisits).omit({ id: true, visitTime: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, completedAt: true });
export const insertCookieAndTrackingSchema = createInsertSchema(cookiesAndTracking).omit({ id: true, createdAt: true });
export const insertUserConsentSchema = createInsertSchema(userConsent).omit({ id: true, consentDate: true });

// Create types for insertion and selection
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLawyerProfile = z.infer<typeof insertLawyerProfileSchema>;
export type LawyerProfile = typeof lawyerProfiles.$inferSelect;

export type InsertClientProfile = z.infer<typeof insertClientProfileSchema>;
export type ClientProfile = typeof clientProfiles.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertLegalResource = z.infer<typeof insertLegalResourceSchema>;
export type LegalResource = typeof legalResources.$inferSelect;

export type InsertLegalNews = z.infer<typeof insertLegalNewsSchema>;
export type LegalNews = typeof legalNews.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;

export type InsertPageVisit = z.infer<typeof insertPageVisitSchema>;
export type PageVisit = typeof pageVisits.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertCookieAndTracking = z.infer<typeof insertCookieAndTrackingSchema>;
export type CookieAndTracking = typeof cookiesAndTracking.$inferSelect;

export type InsertUserConsent = z.infer<typeof insertUserConsentSchema>;
export type UserConsent = typeof userConsent.$inferSelect;

// Combined types for API responses
export type LawyerWithProfile = User & { profile: LawyerProfile };
export type ClientWithProfile = User & { profile: ClientProfile };
