import { z } from 'zod';
import { uuid,
    text,
    integer,
    timestamp,
    pgTable,
    pgEnum,
    decimal,
    boolean,
    json,
    index
} from 'drizzle-orm/pg-core';

import { users } from './users.schema.js';
import { cars } from './cars.schema.js';
import { da } from 'zod/locales';

export const statusEnum = pgEnum('rental_status', [
    'pending', 
    'active',
    'completed', 
    'confirmed', 
    'cancelled']);

export const  fuelStartEnum = pgEnum('fuel_start', [
    'empty', 
    'quarter', 
    'half', 
    'three_quarters', 
    'full']);

export const fuelEndEnum = pgEnum('fuel_end', [
    'empty', 
    'quarter', 
    'half', 
    'three_quarters', 
    'full']);

export const rentals = pgTable('rentals', {
    id: uuid('id').primaryKey().defaultRandom(),
    carId: uuid('car_id').notNull().references(() => cars.id),
    renterId: uuid('renter_id').notNull().references(() => users.id),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time').notNull(),
    pickupLocation: text('pickup_location').notNull(),
    dropoffLocation: text('dropoff_location').notNull(),
    totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
    status: statusEnum('status').notNull().default('pending'),
    mileageStart: integer('mileage_start').notNull(),
    mileageEnd: integer('mileage_end'),
    fuelStart: fuelStartEnum('fuel_start').notNull(),
    fuelEnd: fuelEndEnum('fuel_end'),
    damageReport: json('damage_report').$type<Record<string, any>>(),
    notes: text('notes'),
    insuranceUsed: boolean('insurance_used').notNull().default(false),
    depositReeturned: boolean('deposit_returned').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    carIdIdx: index('car_id_idx').on(table.carId),
    renterIdIdx: index('renter_id_idx').on(table.renterId),
    statusIdx: index('status_idx').on(table.status)
}));

export const insertRentalSchema = z.object({
    carId: z.string().uuid('Invalid car ID'),
    renterId: z.string().uuid('Invalid renter ID'),
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start time'),
    endTime: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end time'),
    pickupLocation: z.string().min(1, 'Pickup location is required'),
    dropoffLocation: z.string().min(1, 'Dropoff location is required'),
    totalPrice: z.string().refine((val) => !isNaN(parseFloat(val)), 'Invalid total price'),
    mileageStart: z.number().min(0, 'Invalid mileage start'),
    mileageEnd: z.number().min(0, 'Invalid mileage end'),
    fuelStart: z.enum(['empty', 'quarter', 'half', 'three_quarters', 'full'], 'Invalid fuel start'),
    fuelEnd: z.enum(['empty', 'quarter', 'half', 'three_quarters', 'full'], 'Invalid fuel end'),
    damageReport: z.record(z.any(), z.string()).optional(),
    notes: z.string().max(255, 'Notes are too long'),
    insuranceUsed: z.boolean().default(false),
    depositReeturned: z.boolean().default(false)
});

export const updateRentalSchema = insertRentalSchema.partial();

export type InsertRentalInput = z.infer<typeof insertRentalSchema>;
export type UpdateRentalInput = z.infer<typeof updateRentalSchema>;
export type Rental = typeof rentals.$inferSelect;
export type NewRental = typeof rentals.$inferInsert;