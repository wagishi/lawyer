import {
  users, lawyerProfiles, clientProfiles, documents,
  chatMessages, legalResources, legalNews, messages,
  type User, type InsertUser,
  type LawyerProfile, type InsertLawyerProfile,
  type ClientProfile, type InsertClientProfile,
  type Document, type InsertDocument,
  type ChatMessage, type InsertChatMessage,
  type LegalResource, type InsertLegalResource,
  type LegalNews, type InsertLegalNews,
  type Message, type InsertMessage,
  type LawyerWithProfile, type ClientWithProfile
} from "@shared/schema";
import { loadLawyerData } from "./dataImport";

export interface IStorage {
  // User management
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  authenticateUser(email: string, password: string): Promise<User | undefined>;
  
  // Lawyer profiles
  createLawyerProfile(profile: InsertLawyerProfile): Promise<LawyerProfile>;
  getLawyerProfileByUserId(userId: number): Promise<LawyerProfile | undefined>;
  getLawyerWithProfile(userId: number): Promise<LawyerWithProfile | undefined>;
  getAllLawyers(filters?: {
    specialization?: string;
    location?: string;
    experienceLevel?: string;
  }): Promise<LawyerWithProfile[]>;
  
  // Client profiles
  createClientProfile(profile: InsertClientProfile): Promise<ClientProfile>;
  getClientProfileByUserId(userId: number): Promise<ClientProfile | undefined>;
  getClientWithProfile(userId: number): Promise<ClientWithProfile | undefined>;
  
  // Document management
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentById(id: number): Promise<Document | undefined>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  getSharedDocuments(userId: number): Promise<Document[]>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Chat messages
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesBySessionId(sessionId: string): Promise<ChatMessage[]>;
  
  // Legal resources
  createLegalResource(resource: InsertLegalResource): Promise<LegalResource>;
  getLegalResourceById(id: number): Promise<LegalResource | undefined>;
  getAllLegalResources(): Promise<LegalResource[]>;
  getLegalResourcesByCategory(category: string): Promise<LegalResource[]>;
  
  // Legal news
  createLegalNews(news: InsertLegalNews): Promise<LegalNews>;
  getLegalNewsById(id: number): Promise<LegalNews | undefined>;
  getAllLegalNews(): Promise<LegalNews[]>;
  getLegalNewsByCategory(category: string): Promise<LegalNews[]>;
  
  // Messaging
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]>;
  getUnreadMessageCount(userId: number): Promise<number>;
  markMessageAsRead(messageId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lawyerProfiles: Map<number, LawyerProfile>;
  private clientProfiles: Map<number, ClientProfile>;
  private documents: Map<number, Document>;
  private chatMessages: Map<number, ChatMessage>;
  private legalResources: Map<number, LegalResource>;
  private legalNews: Map<number, LegalNews>;
  private messages: Map<number, Message>;
  
  private currentIds: {
    user: number;
    lawyerProfile: number;
    clientProfile: number;
    document: number;
    chatMessage: number;
    legalResource: number;
    legalNews: number;
    message: number;
  };

  constructor() {
    this.users = new Map();
    this.lawyerProfiles = new Map();
    this.clientProfiles = new Map();
    this.documents = new Map();
    this.chatMessages = new Map();
    this.legalResources = new Map();
    this.legalNews = new Map();
    this.messages = new Map();
    
    this.currentIds = {
      user: 1,
      lawyerProfile: 1,
      clientProfile: 1,
      document: 1,
      chatMessage: 1,
      legalResource: 1,
      legalNews: 1,
      message: 1
    };
    
    // Add sample legal resources
    this.seedLegalResources();
    // Add sample legal news
    this.seedLegalNews();
    // Load lawyer data from JSON file
    this.loadLawyerData();
  }

  // Load lawyer data from file
  private async loadLawyerData() {
    try {
      const { users, lawyerProfiles } = await loadLawyerData();
      
      if (users.length > 0) {
        // Find the highest ID to ensure our IDs don't conflict
        const maxUserId = Math.max(...users.map(u => u.id), 0);
        this.currentIds.user = maxUserId + 1;
        
        // Add users to the map
        users.forEach(user => {
          this.users.set(user.id, user);
        });

        console.log(`Loaded ${users.length} lawyer users`);
      }
      
      if (lawyerProfiles.length > 0) {
        // Find the highest ID to ensure our IDs don't conflict
        const maxProfileId = Math.max(...lawyerProfiles.map(p => p.id), 0);
        this.currentIds.lawyerProfile = maxProfileId + 1;
        
        // Add profiles to the map
        lawyerProfiles.forEach(profile => {
          this.lawyerProfiles.set(profile.id, profile);
        });

        console.log(`Loaded ${lawyerProfiles.length} lawyer profiles`);
      }
    } catch (error) {
      console.error('Error loading lawyer data:', error);
    }
  }

  // User management
  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const createdAt = new Date();
    const newUser: User = { ...user, id, createdAt };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
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
    const id = this.currentIds.lawyerProfile++;
    const newProfile: LawyerProfile = { ...profile, id };
    this.lawyerProfiles.set(id, newProfile);
    return newProfile;
  }

  async getLawyerProfileByUserId(userId: number): Promise<LawyerProfile | undefined> {
    return Array.from(this.lawyerProfiles.values()).find(profile => profile.userId === userId);
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
    const lawyerUsers = Array.from(this.users.values()).filter(user => user.userType === 'lawyer');
    
    let result: LawyerWithProfile[] = [];
    
    for (const user of lawyerUsers) {
      const profile = await this.getLawyerProfileByUserId(user.id);
      if (profile) {
        result.push({ ...user, profile });
      }
    }
    
    // Apply filters if provided
    if (filters) {
      if (filters.specialization) {
        result = result.filter(lawyer => 
          lawyer.profile.specialization === filters.specialization ||
          lawyer.profile.expertise.includes(filters.specialization!)
        );
      }
      
      if (filters.location) {
        result = result.filter(lawyer => 
          lawyer.profile.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
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
        
        result = result.filter(lawyer => 
          lawyer.profile.yearsOfExperience >= minYears &&
          lawyer.profile.yearsOfExperience <= maxYears
        );
      }
    }
    
    return result;
  }

  // Client profiles
  async createClientProfile(profile: InsertClientProfile): Promise<ClientProfile> {
    const id = this.currentIds.clientProfile++;
    const newProfile: ClientProfile = { ...profile, id };
    this.clientProfiles.set(id, newProfile);
    return newProfile;
  }

  async getClientProfileByUserId(userId: number): Promise<ClientProfile | undefined> {
    return Array.from(this.clientProfiles.values()).find(profile => profile.userId === userId);
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
    const id = this.currentIds.document++;
    const createdAt = new Date();
    const newDocument: Document = { ...document, id, createdAt };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.userId === userId);
  }

  async getSharedDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => 
      doc.isShared && doc.sharedWith && doc.sharedWith.includes(userId)
    );
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Chat messages
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentIds.chatMessage++;
    const createdAt = new Date();
    const newMessage: ChatMessage = { ...message, id, createdAt };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }

  async getChatMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Legal resources
  async createLegalResource(resource: InsertLegalResource): Promise<LegalResource> {
    const id = this.currentIds.legalResource++;
    const createdAt = new Date();
    const newResource: LegalResource = { ...resource, id, createdAt };
    this.legalResources.set(id, newResource);
    return newResource;
  }

  async getLegalResourceById(id: number): Promise<LegalResource | undefined> {
    return this.legalResources.get(id);
  }

  async getAllLegalResources(): Promise<LegalResource[]> {
    return Array.from(this.legalResources.values());
  }

  async getLegalResourcesByCategory(category: string): Promise<LegalResource[]> {
    return Array.from(this.legalResources.values())
      .filter(resource => resource.category === category);
  }

  // Legal news
  async createLegalNews(news: InsertLegalNews): Promise<LegalNews> {
    const id = this.currentIds.legalNews++;
    const publicationDate = new Date();
    const newNews: LegalNews = { ...news, id, publicationDate };
    this.legalNews.set(id, newNews);
    return newNews;
  }

  async getLegalNewsById(id: number): Promise<LegalNews | undefined> {
    return this.legalNews.get(id);
  }

  async getAllLegalNews(): Promise<LegalNews[]> {
    return Array.from(this.legalNews.values());
  }

  async getLegalNewsByCategory(category: string): Promise<LegalNews[]> {
    return Array.from(this.legalNews.values())
      .filter(news => news.category === category);
  }

  // Messaging
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentIds.message++;
    const createdAt = new Date();
    const newMessage: Message = { ...message, id, createdAt, isRead: false };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => 
        (msg.senderId === userId1 && msg.receiverId === userId2) ||
        (msg.senderId === userId2 && msg.receiverId === userId1)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    return Array.from(this.messages.values())
      .filter(msg => msg.receiverId === userId && !msg.isRead)
      .length;
  }

  async markMessageAsRead(messageId: number): Promise<boolean> {
    const message = this.messages.get(messageId);
    if (message) {
      message.isRead = true;
      this.messages.set(messageId, message);
      return true;
    }
    return false;
  }

  // Seed methods for initial data
  private seedLegalResources() {
    const resources: InsertLegalResource[] = [
      {
        title: "Understanding Divorce Law",
        content: "A comprehensive guide to divorce proceedings...",
        category: "Family Law",
        tags: ["divorce", "family law", "child custody"]
      },
      {
        title: "Starting a Business: Legal Considerations",
        content: "Essential legal information for entrepreneurs...",
        category: "Corporate Law",
        tags: ["business", "startup", "incorporation"]
      },
      {
        title: "Tenant Rights Guide",
        content: "Know your rights as a tenant...",
        category: "Real Estate Law",
        tags: ["tenant", "rental", "housing"]
      },
      {
        title: "Patent Application Process",
        content: "Step by step guide to filing a patent...",
        category: "Intellectual Property",
        tags: ["patent", "IP", "invention"]
      }
    ];

    resources.forEach(resource => this.createLegalResource(resource));
  }

  private seedLegalNews() {
    const news: InsertLegalNews[] = [
      {
        title: "Supreme Court Issues Landmark Privacy Ruling",
        content: "The Supreme Court has issued a significant ruling on digital privacy that will impact how law enforcement can access personal data...",
        category: "Constitutional Law",
        imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80",
        source: "Legal Times"
      },
      {
        title: "New Regulations for Business Mergers Announced",
        content: "The Federal Trade Commission has announced stricter regulations for corporate mergers that will affect how businesses...",
        category: "Corporate Law",
        imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80",
        source: "Business Law Journal"
      },
      {
        title: "Major Changes to Visa Process Coming Next Month",
        content: "The Department of Homeland Security announced significant changes to the visa application process that will streamline...",
        category: "Immigration",
        imageUrl: "https://images.unsplash.com/photo-1631644448758-189ceac768d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80",
        source: "Immigration Daily"
      }
    ];

    news.forEach(item => this.createLegalNews(item));
  }
}

import { DatabaseStorage } from "./dbStorage";

// Switch to database storage
export const storage = new DatabaseStorage();

// Using MemStorage for reference
// export const storage = new MemStorage();
