import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-01-27.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle specific event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Create order in database
        try {
          await db.order.create({
            data: {
              orderNumber: `AT-${Date.now()}`,
              email: session.customer_details?.email || "unknown",
              name: session.customer_details?.name || undefined,
              status: "paid",
              total: session.amount_total || 0,
              shippingAddress: JSON.stringify(session.shipping_details?.address || {}),
              stripeSessionId: session.id,
              stripePaymentId: session.payment_intent as string,
              items: {
                create: {
                  quantity: 1,
                  price: session.amount_total || 0,
                  variant: session.metadata?.size || undefined,
                  productId: session.metadata?.productId || "unknown",
                },
              },
            },
          });
          
          console.log("Order created for session:", session.id);
        } catch (dbError) {
          console.error("Database error creating order:", dbError);
          // Don't fail the webhook, just log the error
        }
        
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhooks (Stripe sends raw body)
export const config = {
  api: {
    bodyParser: false,
  },
};
