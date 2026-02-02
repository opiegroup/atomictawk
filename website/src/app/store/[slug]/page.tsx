import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductClient from "./ProductClient";

interface Spec {
  label: string;
  value: string;
}

interface Variant {
  id: string;
  name: string;
  type: string;
  stock_qty: number;
  price_adjustment: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  specs: Spec[];
  price: number;
  compare_price: number | null;
  images: string[];
  category: string;
  serial_no: string | null;
  in_stock: boolean;
  stock_qty: number;
  featured: boolean;
  configurable: boolean;
  variants: Variant[];
}

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_product_by_slug', { p_slug: slug })
    .single();

  if (error || !data) {
    console.error('Error fetching product:', error);
    return null;
  }

  // Parse JSON fields if they're strings
  let specs = data.specs;
  let images = data.images;
  let variants = data.variants;

  if (typeof specs === 'string') {
    try {
      specs = JSON.parse(specs);
    } catch {
      specs = [];
    }
  }

  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch {
      images = [];
    }
  }

  if (typeof variants === 'string') {
    try {
      variants = JSON.parse(variants);
    } catch {
      variants = [];
    }
  }

  return {
    ...data,
    specs: specs || [],
    images: images || [],
    variants: variants || [],
  } as Product;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductClient product={product} />;
}
