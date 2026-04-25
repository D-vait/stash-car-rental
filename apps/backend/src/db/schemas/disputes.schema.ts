import { z } from 'zod';
import { index, 
    pgTable, 
    timestamp, 
    uuid, 
    text,
    pgEnum,
    json
} from 'drizzle-orm/pg-core';

import { rentals } from './rentals.schema.js';
import { users } from './users.schema.js';

const typesEnum = pgEnum('dispute_type', [
    'damage', 
    'delay', 
    'missing_items', 
    'other']);

const statusEnum = pgEnum('dispute_status', [
    'open', 
    'in_review', 
    'resolved', 
    'closed']);

export const disputes = pgTable('disputes', {
    id: uuid('id').primaryKey().defaultRandom(),
    rentalId: uuid('rental_id').notNull().references(() => rentals.id),
    initiatorId: uuid('initiator_id').notNull().references(() => users.id),
    type: typesEnum('type').notNull(),
    description: text('description').notNull(),
    evidence: json('evidence').$type<string[]>(),
    status: statusEnum('status').notNull().default('open'),
    resolution: text('resolution'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at'),
}, (table) => ({
    rentalIdIdx: index('rental_id_idx').on(table.rentalId),
    initiatorIdIdx: index('initiator_id_idx').on(table.initiatorId),
    statusIdx: index('status_idx').on(table.status)
}));

export const insertDisputeSchema = z.object({
    rentalId: z.string().uuid('Invalid rental ID'),
    initiatorId: z.string().uuid('Invalid initiator ID'),
    type: z.enum(['damage', 'delay', 'missing_items', 'other']),
    description: z.string().max(1000, 'Description must be at most 1000 characters'),
    evidence: z.array(z.string().url('Invalid URL')).optional(),
});

export const updateDisputeSchema = z.object({
    type: z.enum(['damage', 'delay', 'missing_items', 'other']).optional(),
    description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
    evidence: z.array(z.string().url('Invalid URL')).optional(),
    status: z.enum(['open', 'in_review', 'resolved', 'closed']).optional(),
    resolution: z.string().optional(),
});

export type InsertDisputeInput = z.infer<typeof insertDisputeSchema>;
export type UpdateDisputeInput = z.infer<typeof updateDisputeSchema>;
export type Dispute = typeof disputes.$inferSelect;
export type NewDispute = typeof disputes.$inferInsert;

