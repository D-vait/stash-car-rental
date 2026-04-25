import { z } from 'zod';
import { pgTable,
    uuid,
    text,
    integer,
    timestamp,
    index
} from 'drizzle-orm/pg-core';

import { users } from './users.schema.js';
import { rentals } from './rentals.schema.js';
import { time } from 'console';

export const rentalReviews = pgTable('rental_reviews', {
    id: uuid('id').primaryKey().defaultRandom(),
    rentalId: uuid('rental_id').notNull().references(() => rentals.id),
    reviewerId: uuid('reviewer_id').notNull().references(() => users.id),
    reviewedId: uuid('reviewed_id').notNull().references(() => users.id),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    cleanliness: integer('cleanliness').notNull(),
    communication: integer('communication').notNull(),
    accuracy: integer('accuracy').notNull(),
    value: integer('value').notNull(),
    createAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    rentalIdIdx: index('rental_id_idx').on(table.rentalId),
    reviewerIdIdx: index('reviewer_id_idx').on(table.reviewerId),
    reviewedIdIdx: index('reviewed_id_idx').on(table.reviewedId)
}));

export const insertRentalReviewSchema = z.object({
    rentalId: z.string().uuid('Invalid rental ID'),
    reviewerId: z.string().uuid('Invalid reviewer ID'),
    reviewedId: z.string().uuid('Invalid reviewed ID'),
    rating: z.number().int()
    .min(1)
    .max(5, 'Rating must be between 1 and 5'),
    comment: z.string()
    .max(500, 'Comment must be at most 500 characters').optional(),
    cleanliness: z.number().int()
    .min(1)
    .max(5, 'Cleanliness rating must be between 1 and 5'),
    communication: z.number().int()
    .min(1)
    .max(5, 'Communication rating must be between 1 and 5'),
    accuracy: z.number().int()
    .min(1)
    .max(5, 'Accuracy rating must be between 1 and 5'),
    value: z.number().int()
    .min(1)
    .max(5, 'Value rating must be between 1 and 5'),
});

export const updateRentalReviewSchema = insertRentalReviewSchema.partial()

export type InsertRentalReviewInput = z.infer<typeof insertRentalReviewSchema>;
export type UpdateRentalReviewInput = z.infer<typeof updateRentalReviewSchema>
export type RentalReview = typeof rentalReviews.$inferSelect;
export type NewRentalReview = typeof rentalReviews.$inferInsert;
