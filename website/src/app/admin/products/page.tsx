"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DraggableList } from "@/components/admin/DraggableList";
import { FormField, Input, Textarea, Select, ImageUpload } from "@/components/admin/FormField";
import { X, Save, ShoppingBag, Plus, Trash2, Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ProductTableEditor } from "@/components/admin/ProductTableEditor";
import { MultiImageUpload } from "@/components/admin/ImageUpload";
import { DocumentUpload } from "@/components/admin/DocumentUpload";

interface ProductVariant {
  id: string;
  name: string;
  type: "size" | "color";
  stock_qty: number;
  price_adjustment: number;
  isNew?: boolean;
}

interface Spec {
  label: string;
  value: string;
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
  description: string;
  long_description: string;
  specs: Spec[];
  price: number;
  compare_price: number | null;
  images: string[];
  category: string;
  serial_no: string;
  in_stock: boolean;
  stock_qty: number;
  configurable: boolean;
  status: "draft" | "published" | "archived";
  sort_order: number;
  variants: ProductVariant[];
  product_tables: ProductTable[];
  pdf_url: string;
  care_instructions: string;
}

const categories = [
  { value: "apparel", label: "Apparel" },
  { value: "poster", label: "Posters" },
  { value: "sticker", label: "Stickers" },
  { value: "patch", label: "Patches" },
  { value: "workbench", label: "Workbenches" },
  { value: "cabinet", label: "Cabinets" },
  { value: "locker", label: "Lockers" },
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabaseClient();
      
      // Fetch products with their variants
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });

      if (productsError) throw productsError;

      // Fetch variants for all products
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*');

      if (variantsError) throw variantsError;

      // Combine products with their variants
      const productsWithVariants = (productsData || []).map(product => {
        let specs = product.specs;
        let images = product.images;

        // Parse JSON fields if they're strings
        if (typeof specs === 'string') {
          try { specs = JSON.parse(specs); } catch { specs = []; }
        }
        if (typeof images === 'string') {
          try { images = JSON.parse(images); } catch { images = []; }
        }

        const productVariants = (variantsData || [])
          .filter(v => v.product_id === product.id)
          .map(v => ({
            id: v.id,
            name: v.name,
            type: v.type as "size" | "color",
            stock_qty: v.stock_qty,
            price_adjustment: v.price_adjustment || 0,
          }));

        return {
          ...product,
          specs: specs || [],
          images: images || [],
          variants: productVariants,
        } as Product;
      });

      setProducts(productsWithVariants);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReorder = async (newItems: Product[]) => {
    // Update local state immediately
    const reorderedProducts = newItems.map((item, index) => ({
      ...item,
      sort_order: index,
    }));
    setProducts(reorderedProducts);

    // Update database
    try {
      const supabase = getSupabaseClient();
      
      for (let i = 0; i < reorderedProducts.length; i++) {
        await supabase
          .from('products')
          .update({ sort_order: i })
          .eq('id', reorderedProducts[i].id);
      }
    } catch (err) {
      console.error('Error reordering products:', err);
      // Reload to get correct order
      loadProducts();
    }
  };

  const handleEdit = (id: string) => {
    const item = products.find((p) => p.id === id);
    if (item) {
      setEditingItem({ 
        ...item, 
        variants: item.variants.map(v => ({ ...v })),
        specs: item.specs.map(s => ({ ...s })),
        images: [...item.images],
        product_tables: item.product_tables ? item.product_tables.map(t => ({ 
          ...t, 
          headers: [...t.headers],
          rows: t.rows.map(r => [...r])
        })) : [],
        long_description: item.long_description || "",
        pdf_url: item.pdf_url || "",
        care_instructions: item.care_instructions || "",
      });
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  const handleToggleStatus = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newStatus = product.status === "published" ? "draft" : "published";

    try {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setProducts(
        products.map((p) =>
          p.id === id ? { ...p, status: newStatus } : p
        )
      );
    } catch (err) {
      console.error('Error toggling status:', err);
      alert('Failed to update status');
    }
  };

  const handleAddNew = () => {
    const serialNum = `AT-NEW-${Math.floor(Math.random() * 99) + 1}`;
    setEditingItem({
      id: "",
      name: "",
      slug: "",
      description: "",
      long_description: "",
      specs: [],
      price: 0,
      compare_price: null,
      images: [],
      category: "apparel",
      serial_no: serialNum,
      in_stock: true,
      stock_qty: 100,
      configurable: false,
      status: "draft",
      sort_order: 0,
      variants: [],
      product_tables: [],
      pdf_url: "",
      care_instructions: "",
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!editingItem || !editingItem.name) return;

    setSaving(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      
      // Generate slug if not set
      const slug = editingItem.slug || generateSlug(editingItem.name);
      
      const productData = {
        name: editingItem.name,
        slug,
        description: editingItem.description,
        long_description: editingItem.long_description,
        specs: editingItem.specs,
        price: editingItem.price,
        compare_price: editingItem.compare_price,
        images: editingItem.images,
        category: editingItem.category,
        serial_no: editingItem.serial_no,
        in_stock: editingItem.in_stock,
        stock_qty: editingItem.stock_qty,
        configurable: editingItem.configurable,
        status: editingItem.status,
        sort_order: editingItem.sort_order,
        product_tables: editingItem.product_tables,
        pdf_url: editingItem.pdf_url,
        care_instructions: editingItem.care_instructions,
      };

      let productId = editingItem.id;

      if (isCreating) {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
      } else {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);

        if (error) throw error;

        // Delete existing variants to replace with new ones
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', productId);
      }

      // Insert variants
      if (editingItem.variants.length > 0) {
        const variantsToInsert = editingItem.variants.map(v => ({
          product_id: productId,
          name: v.name,
          type: v.type,
          stock_qty: v.stock_qty,
          price_adjustment: v.price_adjustment,
        }));

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);

        if (variantError) throw variantError;
      }

      // Reload products
      await loadProducts();
      
      setEditingItem(null);
      setIsCreating(false);
    } catch (err: unknown) {
      console.error('Error saving product:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsCreating(false);
    setError(null);
  };

  const addVariant = () => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      variants: [
        ...editingItem.variants,
        { id: `new-${Date.now()}`, name: "", type: "size", stock_qty: 100, price_adjustment: 0, isNew: true },
      ],
    });
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    if (!editingItem) return;
    const newVariants = [...editingItem.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setEditingItem({ ...editingItem, variants: newVariants });
  };

  const removeVariant = (index: number) => {
    if (!editingItem) return;
    const newVariants = editingItem.variants.filter((_, i) => i !== index);
    setEditingItem({ ...editingItem, variants: newVariants });
  };

  const addSpec = () => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      specs: [...editingItem.specs, { label: "", value: "" }],
    });
  };

  const updateSpec = (index: number, field: 'label' | 'value', value: string) => {
    if (!editingItem) return;
    const newSpecs = [...editingItem.specs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setEditingItem({ ...editingItem, specs: newSpecs });
  };

  const removeSpec = (index: number) => {
    if (!editingItem) return;
    const newSpecs = editingItem.specs.filter((_, i) => i !== index);
    setEditingItem({ ...editingItem, specs: newSpecs });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CCAA4C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Product Management"
        subtitle="Manage your merch and equipment"
        onAddNew={handleAddNew}
        addNewLabel="Add Product"
        showSearch
        onSearch={setSearchQuery}
      />

      <div className="p-6">
        {/* Editor Panel */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center overflow-auto py-10">
            <div className="bg-[#252219] border-2 border-[#AEACA1]/30 w-full max-w-4xl mx-4">
              {/* Editor Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-[#AEACA1]/20">
                <h2 
                  className="text-2xl font-black uppercase tracking-tighter text-white"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {isCreating ? "Create Product" : "Edit Product"}
                </h2>
                <button onClick={handleCancel} className="p-2 text-[#AEACA1] hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Error display */}
              {error && (
                <div className="mx-6 mt-4 p-4 bg-red-900/50 border border-red-500 text-red-200">
                  {error}
                </div>
              )}

              {/* Editor Form */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Product Name" required>
                    <Input
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ 
                        ...editingItem, 
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      })}
                      placeholder="Enter product name..."
                    />
                  </FormField>

                  <FormField label="Slug">
                    <Input
                      value={editingItem.slug}
                      onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                      placeholder="product-slug"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Serial Number">
                    <Input
                      value={editingItem.serial_no}
                      onChange={(e) => setEditingItem({ ...editingItem, serial_no: e.target.value })}
                      placeholder="AT-XXX-XX"
                    />
                  </FormField>

                  <FormField label="Category">
                    <Select
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      options={categories}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField label="Price (cents)" required>
                    <Input
                      type="number"
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })}
                      placeholder="3200 = $32.00"
                    />
                    <p className="text-xs text-[#AEACA1] mt-1">
                      Display: {formatPrice(editingItem.price)}
                    </p>
                  </FormField>

                  <FormField label="Stock Quantity">
                    <Input
                      type="number"
                      value={editingItem.stock_qty}
                      onChange={(e) => setEditingItem({ ...editingItem, stock_qty: parseInt(e.target.value) || 0 })}
                      placeholder="100"
                    />
                  </FormField>

                  <FormField label="Status">
                    <Select
                      value={editingItem.status}
                      onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as Product["status"] })}
                      options={statusOptions}
                    />
                  </FormField>
                </div>

                <FormField label="Short Description">
                  <Textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Brief product description..."
                    rows={2}
                  />
                </FormField>

                <FormField label="Long Description">
                  <Textarea
                    value={editingItem.long_description}
                    onChange={(e) => setEditingItem({ ...editingItem, long_description: e.target.value })}
                    placeholder="Detailed product description for the Description tab..."
                    rows={4}
                  />
                </FormField>

                {/* Product Tables Editor */}
                <div className="border-t-2 border-[#AEACA1]/20 pt-6">
                  <ProductTableEditor
                    tables={editingItem.product_tables}
                    onChange={(tables) => setEditingItem({ ...editingItem, product_tables: tables })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Care Instructions">
                    <Textarea
                      value={editingItem.care_instructions}
                      onChange={(e) => setEditingItem({ ...editingItem, care_instructions: e.target.value })}
                      placeholder="Washing, maintenance instructions..."
                      rows={2}
                    />
                  </FormField>

                  <FormField label="PDF Spec Sheet">
                    <DocumentUpload
                      value={editingItem.pdf_url}
                      onChange={(url) => setEditingItem({ ...editingItem, pdf_url: url })}
                      bucket="documents"
                      folder="product-specs"
                      label="Spec Sheet PDF"
                    />
                  </FormField>
                </div>

                {/* Product Images */}
                <div className="border-t-2 border-[#AEACA1]/20 pt-6">
                  <label className="block text-sm font-bold text-[#AEACA1] uppercase tracking-wider mb-4">
                    Product Images
                  </label>
                  <MultiImageUpload
                    images={editingItem.images}
                    onChange={(images) => setEditingItem({ ...editingItem, images })}
                    bucket="products"
                    folder="images"
                    maxImages={10}
                  />
                  <p className="text-xs text-[#AEACA1]/50 mt-2">
                    First image is the main product image. Drag & drop or click to upload. You can also paste URLs.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField label="In Stock">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingItem.in_stock}
                        onChange={(e) => setEditingItem({ ...editingItem, in_stock: e.target.checked })}
                        className="w-5 h-5 bg-[#1f1c13] border-2 border-[#AEACA1]/30 text-[#CCAA4C] focus:ring-[#CCAA4C]"
                      />
                      <span className="text-white">Product is in stock</span>
                    </label>
                  </FormField>

                  <FormField label="3D Configurable">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingItem.configurable}
                        onChange={(e) => setEditingItem({ ...editingItem, configurable: e.target.checked })}
                        className="w-5 h-5 bg-[#1f1c13] border-2 border-[#AEACA1]/30 text-[#CCAA4C] focus:ring-[#CCAA4C]"
                      />
                      <span className="text-white">Enable 3D configurator</span>
                    </label>
                  </FormField>
                </div>

                {/* Specifications */}
                <div className="border-t-2 border-[#AEACA1]/20 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Technical Specifications</h3>
                    <button
                      onClick={addSpec}
                      className="flex items-center gap-2 text-[#CCAA4C] hover:text-white text-sm font-bold"
                    >
                      <Plus className="w-4 h-4" />
                      Add Spec
                    </button>
                  </div>

                  {editingItem.specs.length > 0 ? (
                    <div className="space-y-3">
                      {editingItem.specs.map((spec, index) => (
                        <div key={index} className="flex items-center gap-4 bg-[#1f1c13] p-4 border border-[#AEACA1]/20">
                          <Input
                            value={spec.label}
                            onChange={(e) => updateSpec(index, "label", e.target.value)}
                            placeholder="Label (e.g., Material)"
                            className="flex-1"
                          />
                          <Input
                            value={spec.value}
                            onChange={(e) => updateSpec(index, "value", e.target.value)}
                            placeholder="Value (e.g., 100% Cotton)"
                            className="flex-1"
                          />
                          <button
                            onClick={() => removeSpec(index)}
                            className="p-2 text-[#AEACA1] hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#AEACA1] italic">
                      No specifications added. Add specs like &quot;Material&quot;, &quot;Dimensions&quot;, etc.
                    </p>
                  )}
                </div>

                {/* Variants */}
                <div className="border-t-2 border-[#AEACA1]/20 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Variants (Sizes/Colors)</h3>
                    <button
                      onClick={addVariant}
                      className="flex items-center gap-2 text-[#CCAA4C] hover:text-white text-sm font-bold"
                    >
                      <Plus className="w-4 h-4" />
                      Add Variant
                    </button>
                  </div>

                  {editingItem.variants.length > 0 ? (
                    <div className="space-y-3">
                      {editingItem.variants.map((variant, index) => (
                        <div key={variant.id} className="flex items-center gap-4 bg-[#1f1c13] p-4 border border-[#AEACA1]/20">
                          <Input
                            value={variant.name}
                            onChange={(e) => updateVariant(index, "name", e.target.value)}
                            placeholder="S, M, L, XL..."
                            className="w-32"
                          />
                          <Select
                            value={variant.type}
                            onChange={(e) => updateVariant(index, "type", e.target.value)}
                            options={[
                              { value: "size", label: "Size" },
                              { value: "color", label: "Color" },
                            ]}
                            className="w-32"
                          />
                          <Input
                            type="number"
                            value={variant.stock_qty}
                            onChange={(e) => updateVariant(index, "stock_qty", parseInt(e.target.value) || 0)}
                            placeholder="Stock"
                            className="w-24"
                          />
                          <span className="text-xs text-[#AEACA1]">in stock</span>
                          <button
                            onClick={() => removeVariant(index)}
                            className="p-2 text-[#AEACA1] hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#AEACA1] italic">
                      No variants added. Add sizes or colors if applicable.
                    </p>
                  )}
                </div>
              </div>

              {/* Editor Footer */}
              <div className="flex items-center justify-end gap-4 p-6 border-t-2 border-[#AEACA1]/20">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border-2 border-[#AEACA1]/30 text-[#AEACA1] font-bold uppercase tracking-widest text-sm hover:border-white hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editingItem.name}
                  className="flex items-center gap-2 px-6 py-3 bg-[#CCAA4C] text-[#353535] font-bold uppercase tracking-widest text-sm hover:bg-[#E3E2D5] transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="mb-6">
          <p className="text-sm text-[#AEACA1] mb-4">
            Drag products to reorder their display order.
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <DraggableList
            items={filteredProducts.map((item) => ({
              id: item.id,
              title: item.name,
              subtitle: `${item.serial_no || 'No Serial'} • ${formatPrice(item.price)} • ${item.category}`,
              image: item.images && item.images[0],
              status: item.status,
            }))}
            onReorder={(newItems) => {
              const reordered = newItems.map((item) => products.find((p) => p.id === item.id)!);
              handleReorder(reordered);
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-[#AEACA1]/30">
            <ShoppingBag className="w-12 h-12 text-[#AEACA1] mx-auto mb-4" />
            <p className="text-[#AEACA1]">No products found</p>
            <button onClick={handleAddNew} className="mt-4 text-[#CCAA4C] hover:underline font-bold">
              Create your first product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
