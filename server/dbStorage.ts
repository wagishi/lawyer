import { db } from "./db";
import { 
  users, lawyerProfiles, clientProfiles, documents, 
  chatMessages, legalResources, legalNews, messages,
  userSessions, pageVisits, transactions, cookiesAndTracking, userConsent,
  type User, type InsertUser,
  type LawyerProfile, type InsertLawyerProfile,
  type ClientProfile, type InsertClientProfile,
  type Document, type InsertDocument,
  type ChatMessage, type InsertChatMessage,
  type LegalResource, type InsertLegalResource,
  type LegalNews, type InsertLegalNews,
  type Message, type InsertMessage,
  type LawyerWithProfile, type ClientWithProfile,
  type UserSession, type InsertUserSession,
  type PageVisit, type InsertPageVisit,
  type Transaction, type InsertTransaction,
  type CookieAndTracking, type InsertCookieAndTracking,
  type UserConsent, type InsertUserConsent
} from "@shared/schema";
import { eq, and, or, like, desc, asc, sql } from "drizzle-orm";
import { IStorage } from "./storage";
import { createId } from "@paralleldrive/cuid2";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User management
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return undefined;
  }

  // Lawyer profiles
  async createLawyerProfile(profile: InsertLawyerProfile): Promise<LawyerProfile> {
    const [newProfile] = await db.insert(lawyerProfiles).values(profile).returning();
    return newProfile;
  }

  async getLawyerProfileByUserId(userId: number): Promise<LawyerProfile | undefined> {
    const [profile] = await db.select().from(lawyerProfiles).where(eq(lawyerProfiles.userId, userId));
    return profile;
  }

  async getLawyerWithProfile(userId: number): Promise<LawyerWithProfile | undefined> {
    const user = await this.getUserById(userId);
    const profile = await this.getLawyerProfileByUserId(userId);
    
    if (user && profile && user.userType === 'lawyer') {
      return { ...user, profile };
    }
    return undefined;
  }

  async getAllLawyers(filters?: {
    specialization?: string;
    location?: string;
    experienceLevel?: string;
  }): Promise<LawyerWithProfile[]> {
    // First, get all lawyer users
    const lawyerUsers = await db.select().from(users).where(eq(users.userType, 'lawyer'));
    
    // Prepare to get all lawyer profiles
    const lawyerIds = lawyerUsers.map(u => u.id);
    
    let result: LawyerWithProfile[] = [];
    
    if (lawyerIds.length > 0) {
      // Get lawyer profiles
      let query = db.select().from(lawyerProfiles);
      
      // Use a series of OR conditions for each userId rather than IN clause
      let userIdConditions = lawyerIds.map(id => eq(lawyerProfiles.userId, id));
      query = query.where(or(...userIdConditions));
      
      // Apply additional filters
      if (filters) {
        if (filters.specialization) {
          query = query.where(eq(lawyerProfiles.specialization, filters.specialization));
        }
        
        if (filters.location) {
          query = query.where(like(lawyerProfiles.location, `%${filters.location}%`));
        }
        
        if (filters.experienceLevel) {
          // Convert experience level string to numeric ranges
          let minYears = 0;
          let maxYears = 100;
          
          switch (filters.experienceLevel) {
            case 'junior':
              maxYears = 3;
              break;
            case 'mid':
              minYears = 4;
              maxYears = 7;
              break;
            case 'senior':
              minYears = 8;
              maxYears = 15;
              break;
            case 'expert':
              minYears = 15;
              break;
          }
          
          query = query.where(
            and(
              sql`${lawyerProfiles.yearsOfExperience} >= ${minYears}`,
              sql`${lawyerProfiles.yearsOfExperience} <= ${maxYears}`
            )
          );
        }
      }
      
      const profiles = await query;
      
      // Match users with their profiles
      for (const user of lawyerUsers) {
        const profile = profiles.find(p => p.userId === user.id);
        if (profile) {
          result.push({ ...user, profile });
        }
      }
    }
    
    return result;
  }

  // Client profiles
  async createClientProfile(profile: InsertClientProfile): Promise<ClientProfile> {
    const [newProfile] = await db.insert(clientProfiles).values(profile).returning();
    return newProfile;
  }

  async getClientProfileByUserId(userId: number): Promise<ClientProfile | undefined> {
    const [profile] = await db.select().from(clientProfiles).where(eq(clientProfiles.userId, userId));
    return profile;
  }

  async getClientWithProfile(userId: number): Promise<ClientWithProfile | undefined> {
    const user = await this.getUserById(userId);
    const profile = await this.getClientProfileByUserId(userId);
    
    if (user && profile && user.userType === 'client') {
      return { ...user, profile };
    }
    return undefined;
  }

  // Document management
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }

  async getSharedDocuments(userId: number): Promise<Document[]> {
    // Note: This is a simplification. In a real app, you would need to use a more 
    // sophisticated query to handle array membership in Postgres
    return await db.select().from(documents).where(
      and(
        eq(documents.isShared, true),
        sql`${userId} = ANY(${documents.sharedWith})`
      )
    );
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result ? true : false;
  }

  // Chat messages
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getChatMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));
  }

  // Legal resources
  async createLegalResource(resource: InsertLegalResource): Promise<LegalResource> {
    const [newResource] = await db.insert(legalResources).values(resource).returning();
    return newResource;
  }

  async getLegalResourceById(id: number): Promise<LegalResource | undefined> {
    const [resource] = await db.select().from(legalResources).where(eq(legalResources.id, id));
    return resource;
  }

  async getAllLegalResources(): Promise<LegalResource[]> {
    return await db.select().from(legalResources);
  }

  async getLegalResourcesByCategory(category: string): Promise<LegalResource[]> {
    return await db.select().from(legalResources).where(eq(legalResources.category, category));
  }

  // Legal news
  async createLegalNews(news: InsertLegalNews): Promise<LegalNews> {
    const [newNews] = await db.insert(legalNews).values(news).returning();
    return newNews;
  }

  async getLegalNewsById(id: number): Promise<LegalNews | undefined> {
    const [news] = await db.select().from(legalNews).where(eq(legalNews.id, id));
    return news;
  }

  async getAllLegalNews(): Promise<LegalNews[]> {
    return await db.select().from(legalNews);
  }

  async getLegalNewsByCategory(category: string): Promise<LegalNews[]> {
    return await db.select().from(legalNews).where(eq(legalNews.category, category));
  }

  // Messaging
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(
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
      .orderBy(asc(messages.createdAt));
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        )
      );
    return result[0].count;
  }

  async markMessageAsRead(messageId: number): Promise<boolean> {
    const result = await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
    return result ? true : false;
  }
}