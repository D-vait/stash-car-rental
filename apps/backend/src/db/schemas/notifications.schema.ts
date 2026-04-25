import { z } from 'zod';
import { pgTable,
    uuid,
    text,
    pgEnum,
    boolean,
    timestamp,
    index
} from 'drizzle-orm/pg-core';

import { users } from './users.schema.js';
import { create } from 'domain';
import { table } from 'console';

export const typesEnum = pgEnum('notification_type', [
        'rental_request',
        'booking_confirmed',
        'rental_started',
        'rental_ended',
        'payment',
        'review_request',
        'message'
]);

export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    type: typesEnum('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    relatedId: uuid('related_id'),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    userIdIdx: index('user_id_idx').on(table.userId),
    typeIdx: index('type_idx').on(table.type),
    isReadIdx: index('is_read_idx').on(table.isRead)
}));

export const insertNotificationSchema = z.object({
    userId: z.string().uuid('Invalid user ID'),
    type: z.enum(['rental_request',
    'booking_confirmed',
    'rental_started',
    'rental_ended',
    'payment',
    'review_request',
    'message']),
    title: z.string().max(100, 'Title must be at most 100 characters'),
    message: z.string().max(500, 'Message must be at most 500 characters'),
    relatedId: z.string().uuid('Invalid related ID').optional(),
});

export const updateNotificationSchema = z.object({
    type: z.enum(['rental_request',
    'booking_confirmed',
    'rental_started',
    'rental_ended',
    'payment',
    'review_request',
    'message']).optional(),
    title: z.string().max(100, 'Title must be at most 100 characters').optional(),
    message: z.string().max(500, 'Message must be at most 500 characters').optional(),
    relatedId: z.string().uuid('Invalid related ID').optional(),
    isRead: z.boolean().optional(),
});

export type InsertNotificationInput = z.infer<typeof insertNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;