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

interface ProductTable {
  title: string;
  headers: string[];
  rows: string[][];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
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
  pdf_url: string | null;
  care_instructions: string | null;
  shipping_info: string | null;
  product_tables: ProductTable[];
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

  // Parse product_tables if it's a string
  let productTables = data.product_tables;
  if (typeof productTables === 'string') {
    try {
      productTables = JSON.parse(productTables);
    } catch {
      productTables = [];
    }
  }

  return {
    ...data,
    specs: specs || [],
    images: images || [],
    variants: variants || [],
    long_description: data.long_description || null,
    pdf_url: data.pdf_url || null,
    care_instructions: data.care_instructions || null,
    shipping_info: data.shipping_info || null,
    product_tables: productTables || [],
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
