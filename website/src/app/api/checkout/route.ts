import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

// Initialize Stripe - in production, ensure STRIPE_SECRET_KEY is set in .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-01-28.clover",
});

interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support both single product (Buy Now) and multiple items (Cart Checkout)
    const items: CartItem[] = body.items || [{ 
      productId: body.productId, 
      quantity: body.quantity || 1, 
      size: body.size 
    }];

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const metadata: Record<string, string> = {
      itemCount: items.length.toString(),
    };

    // Fetch and validate all products
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.productId)
        .eq('status', 'published')
        .single();

      if (error || !product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      if (!product.in_stock || product.stock_qty < item.quantity) {
        return NextResponse.json(
          { error: `${product.name} is out of stock` },
          { status: 400 }
        );
      }

      // Parse images if it's a string
      let images = product.images;
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch {
          images = [];
        }
      }

      const productImage = images && images.length > 0 ? images[0] : null;
      const productName = product.name + (item.size ? ` (Size: ${item.size})` : "");

      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: productName,
            images: productImage ? [productImage] : [],
            description: product.description || "Official Atomic Tawk merchandise",
          },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      });

      // Store item metadata
      metadata[`item_${i}_productId`] = product.id;
      metadata[`item_${i}_slug`] = product.slug;
      metadata[`item_${i}_size`] = item.size || "N/A";
      metadata[`item_${i}_quantity`] = item.quantity.toString();
      metadata[`item_${i}_name`] = product.name;
      metadata[`item_${i}_price`] = product.price.toString();
    }

    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: lineItems,
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
      metadata,
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

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
