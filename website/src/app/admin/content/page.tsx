"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DraggableList } from "@/components/admin/DraggableList";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { FormField, Input, Textarea, Select, ImageUpload } from "@/components/admin/FormField";
import { X, Save, Video, FileText } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  status: "published" | "draft" | "archived";
  type: "video" | "article";
  category: string;
  description: string;
  body: string;
  videoUrl?: string;
  refId: string;
}

// Mock data - in production this comes from database
const initialContent: ContentItem[] = [
  {
    id: "1",
    title: "Burnout Theory: Friction & Torque Calibration",
    subtitle: "Understanding the physics behind the perfect burnout",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
    status: "published",
    type: "video",
    category: "burnouts",
    description: "Understanding the physics behind the perfect burnout",
    body: "",
    videoUrl: "https://youtube.com/watch?v=example",
    refId: "AT-990-2",
  },
  {
    id: "2",
    title: "Piston Wear: Critical Tolerances in High Revs",
    subtitle: "Deep dive into engine maintenance essentials",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    status: "published",
    type: "video",
    category: "shed",
    description: "Deep dive into engine maintenance essentials",
    body: "",
    videoUrl: "https://youtube.com/watch?v=example2",
    refId: "AT-812-4",
  },
  {
    id: "3",
    title: "Bloke Science 101: The Thermodynamics of Oil",
    subtitle: "Why your engine oil matters more than you think",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
    status: "draft",
    type: "article",
    category: "science",
    description: "Why your engine oil matters more than you think",
    body: "<p>Engine oil is the lifeblood of your vehicle...</p>",
    refId: "AT-443-1",
  },
];

const categories = [
  { value: "burnouts", label: "Burnouts & Cars" },
  { value: "shed", label: "The Shed" },
  { value: "science", label: "Bloke Science" },
  { value: "gaming", label: "Gaming" },
  { value: "broadcasts", label: "Broadcasts" },
];

const contentTypes = [
  { value: "video", label: "Video" },
  { value: "article", label: "Article" },
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>(initialContent);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContent = content.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReorder = (newItems: ContentItem[]) => {
    setContent(newItems);
    // In production: save new order to database
  };

  const handleEdit = (id: string) => {
    const item = content.find((c) => c.id === id);
    if (item) {
      setEditingItem({ ...item });
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setContent(content.filter((c) => c.id !== id));
      // In production: delete from database
    }
  };

  const handleToggleStatus = (id: string) => {
    setContent(
      content.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "published" ? "draft" : "published" }
          : c
      )
    );
    // In production: update in database
  };

  const handleAddNew = () => {
    setEditingItem({
      id: `new-${Date.now()}`,
      title: "",
      subtitle: "",
      image: "",
      status: "draft",
      type: "video",
      category: "burnouts",
      description: "",
      body: "",
      videoUrl: "",
      refId: `AT-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9) + 1}`,
    });
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!editingItem) return;

    if (isCreating) {
      setContent([editingItem, ...content]);
    } else {
      setContent(content.map((c) => (c.id === editingItem.id ? editingItem : c)));
    }
    setEditingItem(null);
    setIsCreating(false);
    // In production: save to database
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Content Management"
        subtitle="Manage your broadcasts, videos, and articles"
        onAddNew={handleAddNew}
        addNewLabel="Add Content"
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
                  {isCreating ? "Create Content" : "Edit Content"}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 text-[#AEACA1] hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Editor Form */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Title" required>
                    <Input
                      value={editingItem.title}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, title: e.target.value })
                      }
                      placeholder="Enter title..."
                    />
                  </FormField>

                  <FormField label="Reference ID">
                    <Input
                      value={editingItem.refId}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, refId: e.target.value })
                      }
                      placeholder="AT-XXX-X"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField label="Type">
                    <Select
                      value={editingItem.type}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          type: e.target.value as "video" | "article",
                        })
                      }
                      options={contentTypes}
                    />
                  </FormField>

                  <FormField label="Category">
                    <Select
                      value={editingItem.category}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, category: e.target.value })
                      }
                      options={categories}
                    />
                  </FormField>

                  <FormField label="Status">
                    <Select
                      value={editingItem.status}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          status: e.target.value as "published" | "draft" | "archived",
                        })
                      }
                      options={statusOptions}
                    />
                  </FormField>
                </div>

                <FormField label="Description">
                  <Textarea
                    value={editingItem.description}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, description: e.target.value })
                    }
                    placeholder="Brief description..."
                    rows={3}
                  />
                </FormField>

                <FormField label="Thumbnail Image">
                  <ImageUpload
                    value={editingItem.image || ""}
                    onChange={(url) => setEditingItem({ ...editingItem, image: url })}
                  />
                </FormField>

                {editingItem.type === "video" && (
                  <FormField label="Video URL">
                    <Input
                      value={editingItem.videoUrl || ""}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, videoUrl: e.target.value })
                      }
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </FormField>
                )}

                {editingItem.type === "article" && (
                  <FormField label="Article Content">
                    <RichTextEditor
                      value={editingItem.body}
                      onChange={(value) =>
                        setEditingItem({ ...editingItem, body: value })
                      }
                      placeholder="Write your article here..."
                    />
                  </FormField>
                )}
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

        {/* Content List */}
        <div className="mb-6">
          <p className="text-sm text-[#AEACA1] mb-4">
            Drag items to reorder. Changes are saved automatically.
          </p>
        </div>

        {filteredContent.length > 0 ? (
          <DraggableList
            items={filteredContent.map((item) => ({
              id: item.id,
              title: item.title,
              subtitle: `${item.type === "video" ? "🎬" : "📄"} ${item.category} • ${item.refId}`,
              image: item.image,
              status: item.status,
            }))}
            onReorder={(newItems) => {
              const reorderedContent = newItems.map((item) =>
                content.find((c) => c.id === item.id)!
              );
              handleReorder(reorderedContent);
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-[#AEACA1]/30">
            <FileText className="w-12 h-12 text-[#AEACA1] mx-auto mb-4" />
            <p className="text-[#AEACA1]">No content found</p>
            <button
              onClick={handleAddNew}
              className="mt-4 text-[#CCAA4C] hover:underline font-bold"
            >
              Create your first content
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
