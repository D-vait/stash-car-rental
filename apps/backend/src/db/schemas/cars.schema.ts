import { z } from 'zod';
import { pgTable,
    uuid,
    unique,
    text,
    integer,
    pgEnum,
    decimal,
    doublePrecision,
    timestamp,
    json,
    boolean,
    index 
} from 'drizzle-orm/pg-core';

import { users } from './users.schema.js';

export const carTypeEnum = pgEnum('car_type', [
    'sedan', 
    'suv', 
    'hatchback', 
    'convertible', 
    'coupe', 
    'wagon', 
    'van', 
    'pickup']);

export const fuelTypeEnum = pgEnum('fuel_type', [
    'petrol', 
    'diesel', 
    'hybrid', 
    'electric']);

export const carStatusEnum = pgEnum('car_status', [
    'active', 
    'inactive', 
    'maintenance']);

export const transmissionEnum = pgEnum('transmission', ['automatic', 'manual']);

export const cars = pgTable('cars', {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull().references(() => users.id),
    brand: text('brand').notNull(),
    model: text('model').notNull(),
    year: integer('year').notNull(),
    licensePlate: text('license_plate').notNull().unique(),
    mileage: integer('mileage').notNull(),
    transmission: transmissionEnum('transmission').notNull(),
    fuelType: fuelTypeEnum('fuel_type').notNull(),
    seats: integer('seats').notNull(),
    pricePerHour: decimal('price_per_hour', { precision: 10, scale: 2 }).notNull(),
    pricePerDay: decimal('price_per_day', { precision: 10, scale: 2 }).notNull(),
    pricePerWeek: decimal('price_per_week', { precision: 10, scale: 2 }).notNull(),
    location: text('location').notNull(),
    adress: text('address').notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    features: json('features').$type<string[]>(),
    images: json('images').$type<string[]>(),
    mainImage: text('main_image').notNull(),
    totalTrips: integer('total_trips').notNull().default(0),
    averageRating: doublePrecision('average_rating').notNull().default(0),
    description: text('description'),
    rules: json('rules').$type<Record<string, any>>(),
    insurance: boolean('insurance').notNull().default(false),
    deposit: decimal('deposit', { precision: 10, scale: 2 }).notNull().default('0'),
    documents: json('documents').$type<Record<string, any>>(),
    status: carStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'), // for soft delete
}, (table) => ({
    ownerIdIdx: index('owner_id_idx').on(table.ownerId),
    licensePlateIdx: unique('license_plate_idx').on(table.licensePlate),
    locationIdx: index('location_idx').on(table.location),
    statusIdx: index('status_idx').on(table.status)
}));

export const insertCarSchema = z.object({
    ownerId: z.string().uuid('Invalid owner ID'),
    brand: z.string()
    .min(1, 'Brand is required')
    .max(50, 'Brand must be at most 50 characters'),
    model: z.string()
    .min(1, 'Model is required')
    .max(50, 'Model must be at most 50 characters'),
    year: z.number()
    .int('Year must be an integer')
    .min(1990, 'Year must be at least 1990')
    .max(new Date().getFullYear(), `Year cannot be in the future`),
    licensePlate: z.string()
    .min(1, 'License plate is required')
    .max(20, 'License plate must be at most 20 characters'),
    mileage: z.number()
    .int('Mileage must be an integer')
    .min(0, 'Mileage cannot be negative'),
    transmission: z.enum(['automatic', 'manual'], 'Transmission must be either automatic or manual'),
    fuelType: z.enum(['petrol', 'diesel', 'hybrid', 'electric'], 'Fuel type must be petrol, diesel, hybrid, or electric'),
    seats: z.number()
    .int('Seats must be an integer')
    .min(1, 'Seats must be at least 1')
    .max(10, 'Seats must be at most 10'),
    pricePerHour: z.number()
    .min(0, 'Price per hour cannot be negative'),
    pricePerDay: z.number()
    .min(0, 'Price per day cannot be negative'),
    pricePerWeek: z.number()
    .min(0, 'Price per week cannot be negative'),
    location: z.string()
    .min(1, 'Location is required')
    .max(100, 'Location must be at most 100 characters'),
    address: z.string()
    .min(1, 'Address is required')
    .max(200, 'Address must be at most 200 characters'),
    latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
    longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
    features: z.array(z.string()).optional(),
    images: z.array(z.string()
    .url('Image must be a valid URL')).optional(),
    mainImage: z.string()
    .url('Main image must be a valid URL').optional(),
    description: z.string()
    .max(200, 'Description must be at most 200 characters').optional(),
    rules: z.record(z.string(), z.any(), 
    {error: "Rules must be a valid object"}).optional(),
    insurance: z.boolean().optional().default(false),
    deposit: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    status: z.enum([
        'active', 
        'inactive', 
        'maintenance']).optional().default('active')
});

export const updateCarSchema = insertCarSchema.partial();

export type InsertCarInput = z.infer<typeof insertCarSchema>;
export type UpdateCarInput = z.infer<typeof updateCarSchema>;
export type Car = typeof cars.$inferSelect;
export type NewCar = typeof cars.$inferInsert;