import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe - in production, ensure STRIPE_SECRET_KEY is set in .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-01-27.acacia",
});

// Mock product data - in production this comes from database
const products: Record<string, {
  name: string;
  price: number;
  image: string;
}> = {
  "1": {
    name: "Atomic Tawk Logo Tee",
    price: 3200,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  },
  "2": {
    name: "Mechanical Program Cap",
    price: 2800,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
  },
  "3": {
    name: "The Shed Poster",
    price: 2000,
    image: "https://images.unsplash.com/photo-1561839561-b13bcfe95249?w=800&q=80",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, size, quantity = 1 } = body;

    // Validate product exists
    const product = products[productId];
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: product.name + (size ? ` (Size: ${size})` : ""),
              images: [product.image],
              description: "Official Atomic Tawk merchandise - Approved for mechanical discussion",
            },
            unit_amount: product.price,
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/store`,
      shipping_address_collection: {
        allowed_countries: ["AU", "US", "GB", "NZ", "CA"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 1000,
              currency: "aud",
            },
            display_name: "Standard Shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 10,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 2500,
              currency: "aud",
            },
            display_name: "Express Shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 2,
              },
              maximum: {
                unit: "business_day",
                value: 4,
              },
            },
          },
        },
      ],
      metadata: {
        productId,
        size: size || "N/A",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    
    // Check if it's a Stripe error
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
