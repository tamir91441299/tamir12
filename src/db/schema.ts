import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 'users' table linking with Firebase Auth uid
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  role: text('role').default('user'),
  vibePoints: integer('vibe_points').default(0),
  walletBalance: integer('wallet_balance').default(0),
  packageTier: text('package_tier').default('free'),
  packageExpiresAt: timestamp('package_expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 'recharge_requests' table for balance top-up
export const rechargeRequests = pgTable('recharge_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  userUid: text('user_uid').notNull(),
  amount: integer('amount').notNull(),
  phone: text('phone'),
  status: text('status').default('pending'), // pending, approved, rejected
  paymentMethod: text('payment_method').default('qpay'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 'watch_history' table for tracking continue watching
export const watchHistory = pgTable('watch_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  userUid: text('user_uid').notNull(),
  movieId: text('movie_id').notNull(),
  movieTitle: text('movie_title').notNull(),
  episode: integer('episode').default(1),
  progress: integer('progress').default(0),
  duration: integer('duration').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 'game_scores' table for mini-games leaderboard
export const gameScores = pgTable('game_scores', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  userUid: text('user_uid').notNull(),
  game: text('game').notNull(),
  score: integer('score').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  rechargeRequests: many(rechargeRequests),
  watchHistory: many(watchHistory),
  gameScores: many(gameScores),
}));

export const rechargeRequestsRelations = relations(rechargeRequests, ({ one }) => ({
  user: one(users, {
    fields: [rechargeRequests.userId],
    references: [users.id],
  }),
}));

export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
  user: one(users, {
    fields: [watchHistory.userId],
    references: [users.id],
  }),
}));

export const gameScoresRelations = relations(gameScores, ({ one }) => ({
  user: one(users, {
    fields: [gameScores.userId],
    references: [users.id],
  }),
}));
