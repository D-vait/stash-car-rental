import { z } from 'zod';
import {
    pgTable,
    uuid,
    text,
    varchar,
    pgEnum,
    timestamp,
    doublePrecision,
    boolean,
    integer,
    index,
    uniqueIndex,
} from 'drizzle-orm/pg-core'

export const userTypeEnum = pgEnum('user_type', [
    'admin', 
    'owner', 
    'renter']);

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    // linked to better_auth user table
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 100 }).notNull().unique(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    avatar: text('avatar'),
    rating: doublePrecision('rating').notNull().default(0),
    reviewsCount: integer('reviews_count').notNull().default(0),
    userType: userTypeEnum('user_type').notNull().default('renter'),
    isVerified: boolean('is_verified').notNull().default(false),
    // for owners only
    bankAccount: text('bank_account'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'), // for soft delete
}, (table) => ({
    usernameIdx: uniqueIndex('username_idx').on(table.username),
    emailIdx: uniqueIndex('email_idx').on(table.email),
    userTypeIdx: index('user_type_idx').on(table.userType),
}));

// Zod validation schemas
export const insertUserSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters long')
        .max(100, 'Username must be at most 100 characters'),
    email: z.string().email('Invalid email address'),
    firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name must be at most 50 characters'),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be at most 50 characters'),
    phone: z.string()
        .min(10, 'Phone must be at least 10 characters')
        .max(20, 'Phone must be at most 20 characters')
        .regex(/^\+?[0-9\s\-()]+$/, 'Phone number can only contain digits, spaces, dashes, parentheses and an optional leading +'),
    userType: z.enum(['admin', 'owner', 'renter']).optional(),
    bankAccount: z.string().optional(),
    avatar: z.string().optional(),
});

export const updateUserSchema = insertUserSchema.partial();

export const selectUserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    avatar: z.string().optional(),
    rating: z.number(),
    reviewsCount: z.number(),
    userType: z.enum(['admin', 'owner', 'renter']),
    isVerified: z.boolean(),
    bankAccount: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().optional(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;