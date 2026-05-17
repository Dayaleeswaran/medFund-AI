import { NextResponse } from "next/server";
import { getFintechConfig } from "@/lib/fintech/config";

export async function POST(request: Request) {
  try {
    const config = getFintechConfig();
    const body = await request.json();
    const { amount, campaignId } = body;

    if (!amount || !campaignId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a unique order ID
    const orderId = `IPG-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const returnUrl = new URL(`/api/fintech/ipg/callback?orderId=${orderId}&campaignId=${campaignId}&amount=${amount}`, request.url).toString();

    const merchantId = config.ipg.merchantId;
    const password = config.ipg.password;
    const baseUrl = config.ipg.checkoutUrl; // e.g., https://test-seylan.mtf.gateway.mastercard.com/api/rest/version/100
    
    const auth = Buffer.from(`merchant.${merchantId}:${password}`).toString('base64');

    const payload = {
      apiOperation: "INITIATE_CHECKOUT",
      order: {
        id: orderId,
        amount: Number(amount).toFixed(2),
        currency: "LKR"
      },
      interaction: {
        operation: "PURCHASE",
        returnUrl: returnUrl
      }
    };

    const sessionUrl = `${baseUrl}/merchant/${merchantId}/session`;
    
    console.log("[MPGS] Creating session:", sessionUrl);
    
    const response = await fetch(sessionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || data.result === "ERROR") {
      console.error("[MPGS] Session Error:", data);
      return NextResponse.json(
        { error: data?.error?.explanation || "Failed to create payment session from Seylan Gateway" },
        { status: 400 }
      );
    }

    // data.session.id contains the session identifier needed for checkout.js
    return NextResponse.json({ 
      sessionId: data.session.id, 
      orderId,
      merchantId,
      successIndicator: data.successIndicator
    });
  } catch (error) {
    console.error("IPG Checkout Error:", error);
    return NextResponse.json(
      { error: "Failed to initialize checkout" },
      { status: 500 }
    );
  }
}
