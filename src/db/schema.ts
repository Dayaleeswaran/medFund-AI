import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/** Mirrors Supabase `public.profiles` (1:1 with auth.users) */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name"),
  role: text("role").default("donator"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "set null" }),
  patientName: text("patient_name").notNull(),
  hospitalName: text("hospital_name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  medicalProofUrl: text("medical_proof_url"),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull(),
  raisedAmount: numeric("raised_amount", { precision: 12, scale: 2 }).default(
    "0",
  ),
  urgency: text("urgency").default("high"),
  status: text("status").default("pending_verification"),
  verificationStatus: text("verification_status").default("pending"),
  fraudScore: numeric("fraud_score", { precision: 5, scale: 2 }).default("0"),
  trustScore: numeric("trust_score", { precision: 5, scale: 2 }).default(
    "100",
  ),
  donorCount: integer("donor_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const donations = pgTable("donations", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id")
    .references(() => campaigns.id, { onDelete: "cascade" })
    .notNull(),
  donorId: uuid("donor_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("completed"),
  paymentRef: text("payment_ref"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  balance: numeric("balance", { precision: 12, scale: 2 }).default("0"),
  currency: text("currency").default("LKR"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id")
    .references(() => wallets.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  campaignId: uuid("campaign_id").references(() => campaigns.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id")
    .references(() => campaigns.id, { onDelete: "cascade" })
    .notNull(),
  reviewerId: uuid("reviewer_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  status: text("status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const aiRiskScores = pgTable("ai_risk_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id")
    .references(() => campaigns.id, { onDelete: "cascade" })
    .notNull(),
  riskScore: numeric("risk_score", { precision: 5, scale: 2 }).notNull(),
  signals: jsonb("signals").$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/** Tracks failed password attempts per email (server + DATABASE_URL). */
export const loginCredentialGuards = pgTable("login_credential_guards", {
  emailNorm: text("email_norm").primaryKey(),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

/** In-app admin notifications (e.g. lockouts). View in Supabase Table Editor or build an admin UI. */
export const adminSecurityAlerts = pgTable("admin_security_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  alertType: text("alert_type").notNull(),
  summary: text("summary").notNull(),
  detail: jsonb("detail").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* Relations (for drizzle.query) */

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  wallet: one(wallets, { fields: [profiles.id], references: [wallets.userId] }),
  campaigns: many(campaigns),
  donations: many(donations),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  owner: one(profiles, {
    fields: [campaigns.userId],
    references: [profiles.id],
  }),
  donations: many(donations),
  verifications: many(verifications),
  aiRiskScores: many(aiRiskScores),
  transactions: many(transactions),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [donations.campaignId],
    references: [campaigns.id],
  }),
  donor: one(profiles, { fields: [donations.donorId], references: [profiles.id] }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(profiles, { fields: [wallets.userId], references: [profiles.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
  campaign: one(campaigns, {
    fields: [transactions.campaignId],
    references: [campaigns.id],
  }),
}));

export const verificationsRelations = relations(verifications, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [verifications.campaignId],
    references: [campaigns.id],
  }),
  reviewer: one(profiles, {
    fields: [verifications.reviewerId],
    references: [profiles.id],
  }),
}));

export const aiRiskScoresRelations = relations(aiRiskScores, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [aiRiskScores.campaignId],
    references: [campaigns.id],
  }),
}));

export type Profile = typeof profiles.$inferSelect;
export type CampaignRow = typeof campaigns.$inferSelect;
export type DonationRow = typeof donations.$inferSelect;
export type WalletRow = typeof wallets.$inferSelect;
export type TransactionRow = typeof transactions.$inferSelect;
