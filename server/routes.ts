import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { DatabaseStorage } from "./dbStorage";
import { 
  insertUserSchema, insertLawyerProfileSchema, insertClientProfileSchema, 
  insertDocumentSchema, insertChatMessageSchema, insertMessageSchema 
} from "@shared/schema";
import { getLegalConsultation, analyzeLegalDocument, getLawyerRecommendations } from "./openai";
import { randomUUID } from "crypto";
import { setupAuth } from "./auth";

// Create instance of DatabaseStorage
const storage = new DatabaseStorage();

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Passport.js authentication (this replaces the previous in-memory session management)
  setupAuth(app);

  // Auth middleware using Passport.js
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // User Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userInput = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userInput.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      const user = await storage.createUser(userInput);
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      
      // Set session
      req.session.userId = user.id;
      req.session.userType = user.userType;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.authenticateUser(email, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't return password
      const { password: _, ...userWithoutPassword } = user;
      
      // Set session
      req.session.userId = user.id;
      req.session.userType = user.userType;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUserById(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Lawyer Profile Routes
  app.post("/api/lawyers/profile", requireAuth, async (req, res) => {
    try {
      const profileInput = insertLawyerProfileSchema.parse(req.body);
      
      // Check if user is a lawyer
      const user = await storage.getUserById(req.session.userId!);
      if (!user || user.userType !== "lawyer") {
        return res.status(403).json({ message: "Only lawyers can create lawyer profiles" });
      }
      
      // Check if profile already exists
      const existingProfile = await storage.getLawyerProfileByUserId(req.session.userId!);
      if (existingProfile) {
        return res.status(400).json({ message: "Profile already exists for this user" });
      }
      
      // Set the userId to the current user
      profileInput.userId = req.session.userId!;
      
      const profile = await storage.createLawyerProfile(profileInput);
      res.status(201).json(profile);
    } catch (error) {
      console.error(error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/lawyers", async (req, res) => {
    try {
      const { specialization, location, experienceLevel } = req.query;
      
      const filters = {
        ...(specialization && { specialization: specialization as string }),
        ...(location && { location: location as string }),
        ...(experienceLevel && { experienceLevel: experienceLevel as string })
      };
      
      const lawyers = await storage.getAllLawyers(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      
      // Remove sensitive information from the response
      const lawyersWithoutSensitiveInfo = lawyers.map(lawyer => {
        const { password, ...userWithoutPassword } = lawyer;
        return { ...userWithoutPassword };
      });
      
      res.json(lawyersWithoutSensitiveInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/lawyers/:id", async (req, res) => {
    try {
      const lawyerId = parseInt(req.params.id);
      
      if (isNaN(lawyerId)) {
        return res.status(400).json({ message: "Invalid lawyer ID" });
      }
      
      const lawyer = await storage.getLawyerWithProfile(lawyerId);
      
      if (!lawyer) {
        return res.status(404).json({ message: "Lawyer not found" });
      }
      
      // Don't return password
      const { password, ...lawyerWithoutPassword } = lawyer;
      
      res.json(lawyerWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Client Profile Routes
  app.post("/api/clients/profile", requireAuth, async (req, res) => {
    try {
      const profileInput = insertClientProfileSchema.parse(req.body);
      
      // Check if user is a client
      const user = await storage.getUserById(req.session.userId!);
      if (!user || user.userType !== "client") {
        return res.status(403).json({ message: "Only clients can create client profiles" });
      }
      
      // Check if profile already exists
      const existingProfile = await storage.getClientProfileByUserId(req.session.userId!);
      if (existingProfile) {
        return res.status(400).json({ message: "Profile already exists for this user" });
      }
      
      // Set the userId to the current user
      profileInput.userId = req.session.userId!;
      
      const profile = await storage.createClientProfile(profileInput);
      res.status(201).json(profile);
    } catch (error) {
      console.error(error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Document Management Routes
  app.post("/api/documents", requireAuth, async (req, res) => {
    try {
      const documentInput = insertDocumentSchema.parse(req.body);
      
      // Set the userId to the current user
      documentInput.userId = req.session.userId!;
      
      const document = await storage.createDocument(documentInput);
      res.status(201).json(document);
    } catch (error) {
      console.error(error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/documents", requireAuth, async (req, res) => {
    try {
      const documents = await storage.getDocumentsByUserId(req.session.userId!);
      res.json(documents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/documents/shared", requireAuth, async (req, res) => {
    try {
      const documents = await storage.getSharedDocuments(req.session.userId!);
      res.json(documents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocumentById(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if the user owns the document
      if (document.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this document" });
      }
      
      const deleted = await storage.deleteDocument(documentId);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete document" });
      }
      
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Document Analysis Route
  app.post("/api/documents/analyze", requireAuth, async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Document text is required" });
      }
      
      const analysis = await analyzeLegalDocument(text);
      res.json(analysis);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // AI Consultation Routes
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      // Create a new session ID if not provided
      const chatSessionId = sessionId || randomUUID();
      
      // Get conversation history if session exists
      let history: { role: "user" | "assistant", content: string }[] = [];
      
      if (sessionId) {
        const messages = await storage.getChatMessagesBySessionId(sessionId);
        history = messages.map(msg => ({
          role: msg.isFromAI ? "assistant" : "user",
          content: msg.content
        }));
      }
      
      // Get AI response
      const aiResponse = await getLegalConsultation(message, history);
      
      // Save the user message and AI response
      if (req.session.userId) {
        await storage.createChatMessage({
          userId: req.session.userId,
          content: message,
          isFromAI: false,
          sessionId: chatSessionId
        });
        
        await storage.createChatMessage({
          userId: req.session.userId,
          content: aiResponse,
          isFromAI: true,
          sessionId: chatSessionId
        });
      }
      
      res.json({
        response: aiResponse,
        sessionId: chatSessionId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/ai/chat/:sessionId", requireAuth, async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }
      
      const messages = await storage.getChatMessagesBySessionId(sessionId);
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Lawyer Recommendations
  app.post("/api/ai/lawyer-recommendations", async (req, res) => {
    try {
      const { legalIssue } = req.body;
      
      if (!legalIssue) {
        return res.status(400).json({ message: "Legal issue description is required" });
      }
      
      const recommendations = await getLawyerRecommendations(legalIssue);
      res.json(recommendations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Legal Resources Routes
  app.get("/api/resources", async (req, res) => {
    try {
      const { category } = req.query;
      
      if (category) {
        const resources = await storage.getLegalResourcesByCategory(category as string);
        return res.json(resources);
      }
      
      const resources = await storage.getAllLegalResources();
      res.json(resources);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/resources/:id", async (req, res) => {
    try {
      const resourceId = parseInt(req.params.id);
      
      if (isNaN(resourceId)) {
        return res.status(400).json({ message: "Invalid resource ID" });
      }
      
      const resource = await storage.getLegalResourceById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.json(resource);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Legal News Routes
  app.get("/api/news", async (req, res) => {
    try {
      const { category } = req.query;
      
      if (category) {
        const news = await storage.getLegalNewsByCategory(category as string);
        return res.json(news);
      }
      
      const news = await storage.getAllLegalNews();
      res.json(news);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const newsId = parseInt(req.params.id);
      
      if (isNaN(newsId)) {
        return res.status(400).json({ message: "Invalid news ID" });
      }
      
      const news = await storage.getLegalNewsById(newsId);
      
      if (!news) {
        return res.status(404).json({ message: "News article not found" });
      }
      
      res.json(news);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Messaging Routes
  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const messageInput = insertMessageSchema.parse(req.body);
      
      // Set the senderId to the current user
      messageInput.senderId = req.session.userId!;
      
      // Verify the receiver exists
      const receiver = await storage.getUserById(messageInput.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      const message = await storage.createMessage(messageInput);
      res.status(201).json(message);
    } catch (error) {
      console.error(error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/messages/:userId", requireAuth, async (req, res) => {
    try {
      const otherUserId = parseInt(req.params.userId);
      
      if (isNaN(otherUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const messages = await storage.getMessagesBetweenUsers(req.session.userId!, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/messages/:id/read", requireAuth, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      
      if (isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      
      const marked = await storage.markMessageAsRead(messageId);
      
      if (!marked) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/messages/unread/count", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount(req.session.userId!);
      res.json({ count });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
