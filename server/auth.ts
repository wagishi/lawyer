import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { DatabaseStorage } from "./dbStorage";
import { User } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Create an instance of DatabaseStorage
const storage = new DatabaseStorage();

declare global {
  namespace Express {
    // Define the User interface explicitly to avoid recursive reference
    interface User {
      id: number;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      username: string;
      userType: string;
      phone: string | null;
      address: string | null;
      dateOfBirth: Date | null;
      timezone: string | null;
      createdAt: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "legal-services-platform-secret",
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, userType } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Create username from first name and last name
      const generateUsername = () => {
        return (firstName + lastName).toLowerCase().replace(/[^a-z0-9]/g, '');
      };
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Create new user
      const newUser = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username: generateUsername(),
        userType,
        createdAt: new Date(),
        phone: null,
        address: null,
        dateOfBirth: null,
        timezone: null,
      });
      
      // If userType is lawyer, create lawyer profile
      if (userType === "lawyer") {
        await storage.createLawyerProfile({
          userId: newUser.id,
          specialization: req.body.specialization || "",
          yearsOfExperience: parseInt(req.body.yearsOfExperience) || 0,
          location: req.body.location || "",
          lawSchool: req.body.lawSchool || "",
          barNumber: req.body.barNumber || "",
          biography: req.body.biography || "",
          hourlyRate: parseInt(req.body.hourlyRate) || 0,
          availability: req.body.availability || "",
          languages: req.body.languages || [],
          expertise: req.body.expertise || [],
          education: req.body.education || null,
          publications: req.body.publications || [],
          awards: req.body.awards || [],
          professionalAssociations: req.body.professionalAssociations || [],
          profilePicture: req.body.profilePicture || null,
        });
      }
      
      // If userType is client, create client profile
      if (userType === "client") {
        await storage.createClientProfile({
          userId: newUser.id,
          phone: req.body.phone || null,
          address: req.body.address || null,
          preferredContactMethod: req.body.preferredContactMethod || "email",
        });
      }
      
      // Log the user in after registration
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        return res.status(201).json(newUser);
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Error during registration" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.json(req.user);
  });

  // Helper middleware for route protection
  app.use("/api/protected", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  });
}