import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, boolean, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

export const users = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  emailVerified: timestamp('emailVerified'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('account', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: timestamp('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
}, (table) => {
  return {
    providerProviderAccountIdKey: primaryKey(table.provider, table.providerAccountId),
  }
});

export const sessions = pgTable('session', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
  sessionToken: varchar('sessionToken', { length: 255 }).notNull().unique(),
});

export const verificationTokens = pgTable('verificationToken', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires').notNull(),
}, (table) => {
  return {
    compoundKey: primaryKey(table.identifier, table.token),
  }
});

export const usersRelations = relations(users, ({ many }) => ({
  buyers: many(buyers),
  history: many(buyerHistory),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// Define India's states and union territories
export const stateEnum = z.enum([
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
  'Ladakh',
  'Puducherry',
  'Other'
]);

// Define city enum as per requirement
export const cityEnum = z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']);
export const propertyTypeEnum = z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']);
export const bhkEnum = z.enum(['1', '2', '3', '4', 'Studio']);
export const purposeEnum = z.enum(['Buy', 'Rent']);
export const timelineEnum = z.enum(['0-3m', '3-6m', '>6m', 'Exploring']);
export const sourceEnum = z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']);
export const statusEnum = z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']);

export const buyers = pgTable('buyers', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 80 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 15 }).notNull(),
  city: varchar('city', { length: 50 }).notNull(),
  propertyType: varchar('property_type', { length: 50 }).notNull(),
  bhk: varchar('bhk', { length: 10 }),
  purpose: varchar('purpose', { length: 10 }).notNull(),
  budgetMin: integer('budget_min'),
  budgetMax: integer('budget_max'),
  timeline: varchar('timeline', { length: 10 }).notNull(),
  source: varchar('source', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('New').notNull(),
  notes: text('notes'),
  tags: text('tags').array(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const buyersRelations = relations(buyers, ({ one, many }) => ({
  owner: one(users, { fields: [buyers.ownerId], references: [users.id] }),
  history: many(buyerHistory),
}));

export const buyerHistory = pgTable('buyer_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerId: uuid('buyer_id').notNull().references(() => buyers.id, { onDelete: 'cascade' }),
  changedById: uuid('changed_by_id').notNull().references(() => users.id),
  changedAt: timestamp('changed_at').defaultNow().notNull(),
  diff: jsonb('diff').notNull(),
});

export const buyerHistoryRelations = relations(buyerHistory, ({ one }) => ({
  buyer: one(buyers, { fields: [buyerHistory.buyerId], references: [buyers.id] }),
  changedBy: one(users, { fields: [buyerHistory.changedById], references: [users.id] }),
}));

// Extend the buyer schema with Zod validation
export const insertBuyerSchema = createInsertSchema(buyers, {
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10).max(15).regex(/^\d+$/),
  city: cityEnum,
  propertyType: propertyTypeEnum,
  bhk: bhkEnum.optional().or(z.literal('')),
  purpose: purposeEnum,
  budgetMin: z.number().int().positive().optional().or(z.literal(0)),
  budgetMax: z.number().int().positive().optional().or(z.literal(0)),
  timeline: timelineEnum,
  source: sourceEnum,
  status: statusEnum.default('New').optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  ownerId: z.string().uuid(),
});

// Add custom validation logic with conditional BHK requirement and budget validation
export const buyerSchema = insertBuyerSchema.refine(
  (data) => {
    // BHK is required for Apartment and Villa property types
    if (['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
      return false;
    }
    return true;
  },
  {
    message: "BHK is required for Apartment and Villa property types",
    path: ["bhk"],
  }
).refine(
  (data) => {
    // budgetMax should be greater than or equal to budgetMin if both are present
    if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
      return false;
    }
    return true;
  },
  {
    message: "Maximum budget should be greater than or equal to minimum budget",
    path: ["budgetMax"],
  }
);

export const selectBuyerSchema = createSelectSchema(buyers);

// Schema for CSV import validation
export const csvImportSchema = z.array(
  z.object({
    fullName: z.string().min(2).max(80),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().min(10).max(15).regex(/^\d+$/),
    city: cityEnum,
    propertyType: propertyTypeEnum,
    bhk: bhkEnum.optional().or(z.literal('')),
    purpose: purposeEnum,
    budgetMin: z.coerce.number().int().positive().optional().or(z.literal(0)),
    budgetMax: z.coerce.number().int().positive().optional().or(z.literal(0)),
    timeline: timelineEnum,
    source: sourceEnum,
    status: statusEnum.optional().default('New'),
    notes: z.string().max(1000).optional().or(z.literal('')),
    tags: z.string().optional().transform(tags => 
      tags ? tags.split(',').map(tag => tag.trim()) : []
    ),
  })
).refine(
  data => data.length <= 200,
  {
    message: "CSV import is limited to 200 rows maximum",
  }
);
