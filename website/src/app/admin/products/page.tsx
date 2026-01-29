"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DraggableList } from "@/components/admin/DraggableList";
import { FormField, Input, Textarea, Select, ImageUpload } from "@/components/admin/FormField";
import { X, Save, ShoppingBag, Plus, Trash2 } from "lucide-react";

interface ProductVariant {
  id: string;
  name: string;
  type: "size" | "color";
  stock: number;
}

interface Product {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  status: "published" | "draft" | "archived";
  name: string;
  description: string;
  price: number;
  category: string;
  serialNo: string;
  specs: string;
  inStock: boolean;
  variants: ProductVariant[];
  configurable: boolean;
}

// Mock data - in production this comes from database
const initialProducts: Product[] = [
  {
    id: "1",
    title: "Logo Tee",
    subtitle: "AT-TEE-01 • $32.00",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    status: "published",
    name: "Logo Tee",
    description: "The official Atomic Tawk logo tee. Made from heavy-duty cotton.",
    price: 3200,
    category: "apparel",
    serialNo: "AT-TEE-01",
    specs: "100% Heavy Cotton, 240 GSM",
    inStock: true,
    variants: [
      { id: "v1", name: "S", type: "size", stock: 50 },
      { id: "v2", name: "M", type: "size", stock: 100 },
      { id: "v3", name: "L", type: "size", stock: 75 },
      { id: "v4", name: "XL", type: "size", stock: 40 },
    ],
    configurable: false,
  },
  {
    id: "10",
    title: "Industrial Workbench - Standard",
    subtitle: "AT-WRK-01 • $1,899.00",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
    status: "published",
    name: "Industrial Workbench - Standard",
    description: "Heavy-duty industrial workbench for serious workshop use.",
    price: 189900,
    category: "workbench",
    serialNo: "AT-WRK-01",
    specs: "Steel frame, Hardwood top, 1500mm x 750mm",
    inStock: true,
    variants: [],
    configurable: true,
  },
  {
    id: "20",
    title: "Industrial Tool Cabinet",
    subtitle: "AT-CAB-01 • $2,499.00",
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    status: "published",
    name: "Industrial Tool Cabinet",
    description: "Secure tool storage with multiple drawers and compartments.",
    price: 249900,
    category: "cabinet",
    serialNo: "AT-CAB-01",
    specs: "Steel construction, Dual lock system, 12 drawers",
    inStock: true,
    variants: [],
    configurable: true,
  },
];

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReorder = (newItems: Product[]) => {
    setProducts(newItems);
  };

  const handleEdit = (id: string) => {
    const item = products.find((p) => p.id === id);
    if (item) {
      setEditingItem({ ...item, variants: [...item.variants] });
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setProducts(
      products.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "published" ? "draft" : "published" }
          : p
      )
    );
  };

  const handleAddNew = () => {
    setEditingItem({
      id: `new-${Date.now()}`,
      title: "",
      subtitle: "",
      image: "",
      status: "draft",
      name: "",
      description: "",
      price: 0,
      category: "apparel",
      serialNo: `AT-NEW-${Math.floor(Math.random() * 99) + 1}`,
      specs: "",
      inStock: true,
      variants: [],
      configurable: false,
    });
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!editingItem) return;

    const updatedItem = {
      ...editingItem,
      title: editingItem.name,
      subtitle: `${editingItem.serialNo} • ${formatPrice(editingItem.price)}`,
    };

    if (isCreating) {
      setProducts([updatedItem, ...products]);
    } else {
      setProducts(products.map((p) => (p.id === updatedItem.id ? updatedItem : p)));
    }
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsCreating(false);
  };

  const addVariant = () => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      variants: [
        ...editingItem.variants,
        { id: `v-${Date.now()}`, name: "", type: "size", stock: 100 },
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

              {/* Editor Form */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Product Name" required>
                    <Input
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      placeholder="Enter product name..."
                    />
                  </FormField>

                  <FormField label="Serial Number">
                    <Input
                      value={editingItem.serialNo}
                      onChange={(e) => setEditingItem({ ...editingItem, serialNo: e.target.value })}
                      placeholder="AT-XXX-XX"
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

                  <FormField label="Category">
                    <Select
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      options={categories}
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

                <FormField label="Description">
                  <Textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Product description..."
                    rows={3}
                  />
                </FormField>

                <FormField label="Specifications">
                  <Textarea
                    value={editingItem.specs}
                    onChange={(e) => setEditingItem({ ...editingItem, specs: e.target.value })}
                    placeholder="100% Cotton, 240 GSM, etc."
                    rows={2}
                  />
                </FormField>

                <FormField label="Product Image">
                  <ImageUpload
                    value={editingItem.image || ""}
                    onChange={(url) => setEditingItem({ ...editingItem, image: url })}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-6">
                  <FormField label="In Stock">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingItem.inStock}
                        onChange={(e) => setEditingItem({ ...editingItem, inStock: e.target.checked })}
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
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value) || 0)}
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
                  className="flex items-center gap-2 px-6 py-3 bg-[#CCAA4C] text-[#353535] font-bold uppercase tracking-widest text-sm hover:bg-[#E3E2D5] transition-colors"
                >
                  <Save className="w-4 h-4" />
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
              subtitle: `${item.serialNo} • ${formatPrice(item.price)} • ${item.category}`,
              image: item.image,
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
