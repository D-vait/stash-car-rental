import { z } from 'zod';
import { uuid,
    text,
    integer,
    timestamp,
    pgTable
} from 'drizzle-orm/pg-core';

import { cars } from './cars.schema.js';

export const carPhotos = pgTable('car_photos', {
    id: uuid('id').primaryKey(),
    carId: uuid('car_id').references(() => cars.id),
    url: text('url').notNull(),
    orderIndex: integer('order_index').notNull(),
    uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
});

export const insertCarPhotoSchema = z.object({
    carId: z.string().uuid('Invalid car ID'),
    url: z.string().url('Invalid URL'),
    orderIndex: z.number().int('Order index must be an integer').nonnegative('Order index must be non-negative')
});

export const updateCarPhotoSchema = insertCarPhotoSchema.partial()

export type InsertCarPhotoInput = z.infer<typeof insertCarPhotoSchema>;
export type UpdateCarPhotoInput = z.infer<typeof updateCarPhotoSchema>;
export type CarPhoto = typeof carPhotos.$inferSelect;
export type NewCarPhoto = typeof carPhotos.$inferInsert;