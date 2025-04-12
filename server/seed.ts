import { db } from "./db";
import { users, lawyerProfiles, legalResources, legalNews, clientProfiles } from "@shared/schema";
import { loadLawyerData } from "./dataImport";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";

const SALT_ROUNDS = 10;

async function seedUsers() {
  console.log("Seeding users...");
  
  const { users: lawyerUsers, lawyerProfiles: lawyerProfilesData } = await loadLawyerData();
  
  // Insert lawyers
  for (const user of lawyerUsers) {
    try {
      const existingUsers = await db.select().from(users).where(sql`${users.email} = ${user.email}`);
      const existingUser = existingUsers.length > 0 ? existingUsers[0] : null;
      
      if (!existingUser) {
        // Create a hashed password - use a default password since none is provided in the data
        const defaultPassword = "Password123!";
        const hashedPassword = await bcrypt.hash(defaultPassword, SALT_ROUNDS);
        
        // Define the base required user data - generate username from first name and last name if not provided
        const generateUsername = () => {
          return (user.firstName + user.lastName).toLowerCase().replace(/[^a-z0-9]/g, '');
        };
        
        const userData: any = {
          email: user.email,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username || generateUsername(),
          userType: user.userType,
          createdAt: new Date(),
          // Set default null values for required fields
          phone: null,
          address: null,
          dateOfBirth: null,
          location: null,
          preferences: null,
          timezone: null
        };
        
        // Override the nulls with actual values if they exist
        if (user.phone) userData.phone = user.phone;
        if (user.address) userData.address = user.address;
        if (user.dateOfBirth) userData.dateOfBirth = user.dateOfBirth;
        if (user.location) userData.location = user.location;
        if (user.preferences) userData.preferences = user.preferences;
        if (user.timezone) userData.timezone = user.timezone;
        
        const [newUser] = await db.insert(users).values(userData).returning();
          
        console.log(`Created user: ${newUser.firstName} ${newUser.lastName}`);
      }
    } catch (error) {
      console.error(`Error seeding user ${user.email}:`, error);
    }
  }
  
  // Insert sample client users
  const clientsData = [
    {
      email: "client1@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      userType: "client",
      phone: "555-123-4567",
      address: "123 Main St",
      dateOfBirth: new Date("1985-05-15"),
      location: null, // Not in schema
      preferences: null, // Not in schema
      timezone: "America/New_York",
    },
    {
      email: "client2@example.com",
      password: "password123",
      firstName: "Sarah",
      lastName: "Johnson",
      username: "sarahj",
      userType: "client",
      phone: "555-987-6543",
      address: "456 Oak Ave",
      dateOfBirth: new Date("1990-10-22"),
      location: null, // Not in schema
      preferences: null, // Not in schema
      timezone: "America/Los_Angeles",
    },
  ];
  
  for (const client of clientsData) {
    try {
      const existingUsers = await db.select().from(users).where(sql`${users.email} = ${client.email}`);
      const existingUser = existingUsers.length > 0 ? existingUsers[0] : null;
      
      if (!existingUser) {
        // Create a hashed password
        const hashedPassword = await bcrypt.hash(client.password, SALT_ROUNDS);
        
        const [newUser] = await db
          .insert(users)
          .values({
            email: client.email,
            password: hashedPassword,
            firstName: client.firstName,
            lastName: client.lastName,
            username: client.username,
            userType: client.userType,
            phone: client.phone,
            address: client.address,
            dateOfBirth: client.dateOfBirth,
            timezone: client.timezone,
            createdAt: new Date(),
          })
          .returning();
          
        console.log(`Created client user: ${newUser.firstName} ${newUser.lastName}`);
      }
    } catch (error) {
      console.error(`Error seeding client ${client.email}:`, error);
    }
  }
}

async function seedLawyerProfiles() {
  console.log("Seeding lawyer profiles...");
  
  const { lawyerProfiles: profiles } = await loadLawyerData();
  
  // Map of userId to email for lookup
  const userIdToEmail = new Map();
  for (const u of await db.select().from(users).where(eq(users.userType, 'lawyer'))) {
    userIdToEmail.set(u.id, u.email);
  }
  
  for (const profile of profiles) {
    // Find the associated user by matching the profile.userId with user.id
    const existingUsers = await db.select().from(users).where(eq(users.id, profile.userId));
    const user = existingUsers.length > 0 ? existingUsers[0] : null;
    
    if (user) {
      const existingProfiles = await db.select().from(lawyerProfiles).where(eq(lawyerProfiles.userId, user.id));
      const existingProfile = existingProfiles.length > 0 ? existingProfiles[0] : null;
      
      if (!existingProfile) {
        const [newProfile] = await db
          .insert(lawyerProfiles)
          .values({
            userId: user.id,
            specialization: profile.specialization,
            yearsOfExperience: profile.yearsOfExperience,
            location: profile.location,
            lawSchool: profile.lawSchool,
            barNumber: profile.barNumber,
            biography: profile.biography,
            hourlyRate: profile.hourlyRate,
            availability: profile.availability,
            languages: profile.languages,
            expertise: profile.expertise,
            education: profile.education,
            publications: profile.publications,
            awards: profile.awards,
            professionalAssociations: profile.professionalAssociations,
            profilePicture: profile.profilePicture || null,
          })
          .returning();
          
        console.log(`Created lawyer profile for: ${user.firstName} ${user.lastName}`);
      }
    }
  }
}

async function seedClientProfiles() {
  console.log("Seeding client profiles...");
  
  // Get all client users
  const clientUsers = await db.select().from(users).where(eq(users.userType, "client"));
  
  for (const user of clientUsers) {
    const existingProfiles = await db.select().from(clientProfiles).where(eq(clientProfiles.userId, user.id));
    const existingProfile = existingProfiles.length > 0 ? existingProfiles[0] : null;
    
    if (!existingProfile) {
      const [newProfile] = await db
        .insert(clientProfiles)
        .values({
          userId: user.id,
          phone: user.phone,
          address: user.address,
          preferredContactMethod: "email",
        })
        .returning();
        
      console.log(`Created client profile for: ${user.firstName} ${user.lastName}`);
    }
  }
}

async function seedLegalResources() {
  console.log("Seeding legal resources...");
  
  const resourcesData = [
    {
      title: "Understanding Contract Law Basics",
      content: "This guide covers the fundamental principles of contract law, including formation, consideration, and breach of contract. Ideal for small business owners and individuals.",
      category: "Contract Law",
      tags: ["contracts", "business law", "legal agreements"],
    },
    {
      title: "Family Law: Divorce Proceedings",
      content: "A comprehensive overview of divorce proceedings, covering asset division, child custody, and alimony considerations.",
      category: "Family Law",
      tags: ["divorce", "family law", "custody"],
    },
    {
      title: "Intellectual Property Rights for Creators",
      content: "Learn about copyright, trademark, and patent protections for creative works, inventions, and brand identities.",
      category: "Intellectual Property",
      tags: ["copyright", "trademark", "patents", "IP law"],
    },
    {
      title: "Employment Law: Workers' Rights",
      content: "An essential guide to employment rights, workplace discrimination, and wrongful termination cases.",
      category: "Employment Law",
      tags: ["workplace", "discrimination", "workers rights"],
    },
    {
      title: "Personal Injury Claims Process",
      content: "Step-by-step guidance through the personal injury claims process, from documentation to settlement negotiation.",
      category: "Personal Injury",
      tags: ["injury claims", "damages", "settlements"],
    },
  ];
  
  for (const resource of resourcesData) {
    const existingResources = await db.select().from(legalResources).where(eq(legalResources.title, resource.title));
    const existingResource = existingResources.length > 0 ? existingResources[0] : null;
    
    if (!existingResource) {
      const [newResource] = await db
        .insert(legalResources)
        .values({
          ...resource,
          createdAt: new Date(),
        })
        .returning();
        
      console.log(`Created legal resource: ${newResource.title}`);
    }
  }
}

async function seedLegalNews() {
  console.log("Seeding legal news...");
  
  const newsData = [
    {
      title: "Supreme Court Issues Landmark Privacy Ruling",
      content: "In a 7-2 decision, the Supreme Court has ruled that law enforcement agencies must obtain a warrant before accessing cellular location data, marking a significant advancement in digital privacy protections.",
      category: "Constitutional Law",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3270&q=80",
      source: "Legal Times",
    },
    {
      title: "New Legislation Enhances Environmental Protections",
      content: "Congress has passed a comprehensive environmental bill that strengthens regulations on industrial emissions and provides funding for renewable energy initiatives.",
      category: "Environmental Law",
      imageUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2874&q=80",
      source: "Environmental Law Journal",
    },
    {
      title: "Major Class Action Settlement in Pharmaceutical Case",
      content: "A pharmaceutical company has agreed to a $2.1 billion settlement in a class action lawsuit regarding undisclosed side effects of its popular arthritis medication.",
      category: "Healthcare Law",
      imageUrl: "https://images.unsplash.com/photo-1554734867-bf3c00a49371?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3270&q=80",
      source: "Health Law Review",
    },
    {
      title: "International Treaty on Digital Trade Enters Force",
      content: "After ratification by 24 countries, the International Digital Trade Agreement has officially taken effect, establishing global standards for e-commerce and cross-border data flows.",
      category: "International Law",
      imageUrl: "https://images.unsplash.com/photo-1607703703520-bb638e84caf2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80",
      source: "Global Legal Monitor",
    },
    {
      title: "State Bar Association Announces Ethics Reforms",
      content: "The State Bar Association has approved comprehensive ethics reforms, including enhanced oversight of attorney advertising and stricter conflict of interest disclosures.",
      category: "Legal Ethics",
      imageUrl: "https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2669&q=80",
      source: "Bar Journal",
    },
  ];
  
  for (const news of newsData) {
    const existingNewsItems = await db.select().from(legalNews).where(eq(legalNews.title, news.title));
    const existingNews = existingNewsItems.length > 0 ? existingNewsItems[0] : null;
    
    if (!existingNews) {
      const [newNews] = await db
        .insert(legalNews)
        .values({
          ...news,
          publicationDate: new Date(),
        })
        .returning();
        
      console.log(`Created legal news: ${newNews.title}`);
    }
  }
}

async function seed() {
  try {
    await seedUsers();
    await seedLawyerProfiles();
    await seedClientProfiles();
    await seedLegalResources();
    await seedLegalNews();
    
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seed();