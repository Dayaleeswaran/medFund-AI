import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { campaigns } from "@/db/schema";

export async function listCampaignsDb(limit = 50) {
  return getDb()
    .select()
    .from(campaigns)
    .orderBy(desc(campaigns.createdAt))
    .limit(limit);
}

export async function getCampaignByIdDb(id: string) {
  const rows = await getDb()
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, id));
  return rows[0] ?? null;
}
