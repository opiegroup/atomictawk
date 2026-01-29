"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { FormField, Input, Textarea, Select, ImageUpload } from "@/components/admin/FormField";
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Edit, 
  Image, 
  Type, 
  Film, 
  Layout, 
  Grid3X3,
  Quote,
  List,
  X,
  Save,
  Eye
} from "lucide-react";

type BlockType = "hero" | "text" | "image" | "video" | "grid" | "quote" | "cta";

interface Block {
  id: string;
  type: BlockType;
  content: Record<string, string>;
}

interface Page {
  id: string;
  name: string;
  slug: string;
  blocks: Block[];
}

const blockTypes: { type: BlockType; label: string; icon: typeof Type }[] = [
  { type: "hero", label: "Hero Section", icon: Layout },
  { type: "text", label: "Text Block", icon: Type },
  { type: "image", label: "Image", icon: Image },
  { type: "video", label: "Video Embed", icon: Film },
  { type: "grid", label: "Content Grid", icon: Grid3X3 },
  { type: "quote", label: "Quote", icon: Quote },
  { type: "cta", label: "Call to Action", icon: List },
];

const defaultBlockContent: Record<BlockType, Record<string, string>> = {
  hero: { title: "Hero Title", subtitle: "Hero subtitle text", buttonText: "Learn More", buttonLink: "/" },
  text: { heading: "", body: "Enter your text content here..." },
  image: { url: "", alt: "", caption: "" },
  video: { url: "", title: "" },
  grid: { columns: "3", items: "[]" },
  quote: { text: "Quote text here...", author: "Author Name" },
  cta: { title: "Call to Action", description: "Description text", buttonText: "Click Here", buttonLink: "/" },
};

// Sortable Block Component
function SortableBlock({ 
  block, 
  onEdit, 
  onDelete 
}: { 
  block: Block; 
  onEdit: (block: Block) => void; 
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const BlockIcon = blockTypes.find(b => b.type === block.type)?.icon || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 bg-[#252219] border-2 border-[#AEACA1]/20 p-4 ${
        isDragging ? "opacity-50 border-[#CCAA4C]" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 text-[#AEACA1] hover:text-white"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="w-10 h-10 bg-[#CCAA4C]/20 flex items-center justify-center">
        <BlockIcon className="w-5 h-5 text-[#CCAA4C]" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white capitalize">{block.type} Block</h3>
        <p className="text-sm text-[#AEACA1] truncate">
          {block.content.title || block.content.heading || block.content.text || "No content"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(block)}
          className="p-2 text-[#AEACA1] hover:text-[#CCAA4C] transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(block.id)}
          className="p-2 text-[#AEACA1] hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function PageBuilderPage() {
  const [pages, setPages] = useState<Page[]>([
    {
      id: "home",
      name: "Homepage",
      slug: "/",
      blocks: [
        { id: "1", type: "hero", content: { title: "Tawk Loud. Drive Louder. Feel Prouder.", subtitle: "Powering the Mechanical Conversation", buttonText: "Start Broadcast", buttonLink: "/shows" } },
        { id: "2", type: "grid", content: { columns: "3", items: "Featured content grid" } },
        { id: "3", type: "text", content: { heading: "About Us", body: "Atomic Tawk is a broadcast service for the mechanically inclined..." } },
      ],
    },
  ]);
  
  const [selectedPage, setSelectedPage] = useState<Page>(pages[0]);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [showAddBlock, setShowAddBlock] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = selectedPage.blocks.findIndex((b) => b.id === active.id);
      const newIndex = selectedPage.blocks.findIndex((b) => b.id === over.id);
      
      const newBlocks = arrayMove(selectedPage.blocks, oldIndex, newIndex);
      const updatedPage = { ...selectedPage, blocks: newBlocks };
      
      setSelectedPage(updatedPage);
      setPages(pages.map(p => p.id === updatedPage.id ? updatedPage : p));
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: { ...defaultBlockContent[type] },
    };
    
    const updatedPage = {
      ...selectedPage,
      blocks: [...selectedPage.blocks, newBlock],
    };
    
    setSelectedPage(updatedPage);
    setPages(pages.map(p => p.id === updatedPage.id ? updatedPage : p));
    setShowAddBlock(false);
  };

  const deleteBlock = (id: string) => {
    if (confirm("Delete this block?")) {
      const updatedPage = {
        ...selectedPage,
        blocks: selectedPage.blocks.filter(b => b.id !== id),
      };
      setSelectedPage(updatedPage);
      setPages(pages.map(p => p.id === updatedPage.id ? updatedPage : p));
    }
  };

  const saveBlockEdit = () => {
    if (!editingBlock) return;
    
    const updatedPage = {
      ...selectedPage,
      blocks: selectedPage.blocks.map(b => b.id === editingBlock.id ? editingBlock : b),
    };
    
    setSelectedPage(updatedPage);
    setPages(pages.map(p => p.id === updatedPage.id ? updatedPage : p));
    setEditingBlock(null);
  };

  const updateBlockContent = (key: string, value: string) => {
    if (!editingBlock) return;
    setEditingBlock({
      ...editingBlock,
      content: { ...editingBlock.content, [key]: value },
    });
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Page Builder"
        subtitle="Drag and drop to build your pages"
      />

      <div className="flex">
        {/* Page List Sidebar */}
        <div className="w-64 bg-[#1f1c13] border-r-2 border-[#AEACA1]/20 p-4 min-h-[calc(100vh-140px)]">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#AEACA1] mb-4">
            Pages
          </h3>
          <div className="space-y-2">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPage(page)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  selectedPage.id === page.id
                    ? "bg-[#CCAA4C] text-[#353535]"
                    : "text-[#AEACA1] hover:bg-[#AEACA1]/10 hover:text-white"
                }`}
              >
                <span className="font-bold">{page.name}</span>
                <span className="block text-xs opacity-60">{page.slug}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Page Editor */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
                {selectedPage.name}
              </h2>
              <p className="text-sm text-[#AEACA1]">{selectedPage.blocks.length} blocks</p>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-4 py-2 border-2 border-[#AEACA1]/30 text-[#AEACA1] hover:text-white hover:border-white transition-colors">
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setShowAddBlock(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#CCAA4C] text-[#353535] font-bold hover:bg-[#E3E2D5] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Block
              </button>
            </div>
          </div>

          {/* Blocks List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedPage.blocks}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {selectedPage.blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    onEdit={setEditingBlock}
                    onDelete={deleteBlock}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {selectedPage.blocks.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-[#AEACA1]/30">
              <Layout className="w-12 h-12 text-[#AEACA1] mx-auto mb-4" />
              <p className="text-[#AEACA1]">No blocks yet</p>
              <button
                onClick={() => setShowAddBlock(true)}
                className="mt-4 text-[#CCAA4C] hover:underline font-bold"
              >
                Add your first block
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Block Modal */}
      {showAddBlock && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-[#252219] border-2 border-[#AEACA1]/30 w-full max-w-2xl mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
                Add Block
              </h3>
              <button onClick={() => setShowAddBlock(false)} className="p-2 text-[#AEACA1] hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {blockTypes.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-[#AEACA1]/30 hover:border-[#CCAA4C] hover:bg-[#CCAA4C]/10 transition-colors"
                >
                  <Icon className="w-8 h-8 text-[#CCAA4C]" />
                  <span className="text-sm font-bold text-white">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Block Modal */}
      {editingBlock && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center overflow-auto py-10">
          <div className="bg-[#252219] border-2 border-[#AEACA1]/30 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-6 border-b-2 border-[#AEACA1]/20">
              <h3 className="text-xl font-black text-white capitalize" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
                Edit {editingBlock.type} Block
              </h3>
              <button onClick={() => setEditingBlock(null)} className="p-2 text-[#AEACA1] hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-auto">
              {Object.entries(editingBlock.content).map(([key, value]) => (
                <FormField key={key} label={key.replace(/([A-Z])/g, ' $1').trim()}>
                  {key === 'body' || key === 'description' ? (
                    <Textarea
                      value={value}
                      onChange={(e) => updateBlockContent(key, e.target.value)}
                      rows={4}
                    />
                  ) : key === 'url' && editingBlock.type === 'image' ? (
                    <ImageUpload
                      value={value}
                      onChange={(url) => updateBlockContent(key, url)}
                    />
                  ) : (
                    <Input
                      value={value}
                      onChange={(e) => updateBlockContent(key, e.target.value)}
                    />
                  )}
                </FormField>
              ))}
            </div>

            <div className="flex items-center justify-end gap-4 p-6 border-t-2 border-[#AEACA1]/20">
              <button
                onClick={() => setEditingBlock(null)}
                className="px-6 py-3 border-2 border-[#AEACA1]/30 text-[#AEACA1] font-bold uppercase tracking-widest text-sm hover:border-white hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveBlockEdit}
                className="flex items-center gap-2 px-6 py-3 bg-[#CCAA4C] text-[#353535] font-bold uppercase tracking-widest text-sm hover:bg-[#E3E2D5] transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
