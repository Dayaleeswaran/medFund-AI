import { isFintechConfigured } from "@/lib/fintech/config";

export async function GET() {
  return Response.json({
    configured: isFintechConfigured(),
    timestamp: new Date().toISOString(),
  });
}
