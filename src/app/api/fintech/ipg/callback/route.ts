import { NextResponse } from "next/server";
import { getFintechConfig } from "@/lib/fintech/config";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const campaignId = searchParams.get("campaignId");
    const amount = searchParams.get("amount");
    const resultIndicator = searchParams.get("resultIndicator");

    if (!orderId || !campaignId || !resultIndicator) {
      return NextResponse.redirect(new URL(`/campaign/${campaignId}?ipg_error=missing_params`, origin));
    }

    const config = getFintechConfig();
    const merchantId = config.ipg.merchantId;
    const password = config.ipg.password;
    const baseUrl = config.ipg.checkoutUrl; // e.g., https://test-seylan.mtf.gateway.mastercard.com/api/rest/version/100
    
    // 1. Verify the order status directly with Seylan MPGS server
    const auth = Buffer.from(`merchant.${merchantId}:${password}`).toString('base64');
    const verifyUrl = `${baseUrl}/merchant/${merchantId}/order/${orderId}`;
    
    console.log("[MPGS] Verifying order:", verifyUrl);
    const verifyResponse = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`
      }
    });

    const verifyData = await verifyResponse.json();
    
    // MPGS returns order.status as CAPTURED or AUTHORIZED if successful
    if (!verifyResponse.ok || (verifyData.status !== "CAPTURED" && verifyData.status !== "AUTHORIZED")) {
      console.error("[MPGS] Verification failed:", verifyData);
      return NextResponse.redirect(new URL(`/campaign/${campaignId}?ipg_error=payment_failed`, origin));
    }

    // 2. Log it in the database
    try {
      await fetch(`${origin}/api/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          amount: Number(amount),
          paymentRef: `IPG-${orderId}`,
        }),
      });
    } catch (e) {
      console.warn("Could not log IPG donation to DB", e);
    }

    // 3. Redirect back to campaign with success
    return NextResponse.redirect(new URL(`/campaign/${campaignId}?ipg_success=true`, origin));
    
  } catch (error) {
    console.error("IPG Callback Error:", error);
    return NextResponse.redirect(new URL(`/campaigns?ipg_error=system_error`, new URL(request.url).origin));
  }
}
