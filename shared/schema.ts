import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'women' | 'kids' | 'home' | 'products'
  priceMin: integer("price_min").notNull(),
  priceMax: integer("price_max").notNull(),
  duration: integer("duration").notNull(), // in minutes
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  serviceIds: jsonb("service_ids").notNull(), // array of service IDs
  appointmentDate: timestamp("appointment_date").notNull(),
  status: text("status").default("pending"), // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  totalAmount: integer("total_amount"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const aiConversations = pgTable("ai_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  messages: jsonb("messages").notNull(), // array of {role, content, timestamp}
  customerId: varchar("customer_id").references(() => customers.id),
  bookingId: varchar("booking_id").references(() => bookings.id),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  serviceInterest: text("service_interest").notNull(),
  address: text("address").notNull(),
  message: text("message").notNull(),
  emailSent: boolean("email_sent").default(false),
  excelUpdated: boolean("excel_updated").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  isActive: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true,
}).extend({
  appointmentDate: z.string().or(z.date()).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
  emailSent: true,
  excelUpdated: true,
});

export type Service = typeof services.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type AiConversation = typeof aiConversations.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
