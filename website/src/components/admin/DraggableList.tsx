"use client";

import { useState, useRef } from "react";
import { GripVertical, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface Item {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  status?: "published" | "draft" | "archived";
}

interface DraggableItemProps {
  item: Item;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  onDrop: (fromIndex: number, toIndex: number) => void;
  draggedIndex: number | null;
}

function DraggableItem({ 
  item, 
  index, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedIndex,
}: DraggableItemProps) {
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  
  const isDragging = draggedIndex === index;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    onDragStart(index);
  };

  const handleDragEnd = () => {
    onDragEnd();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    if (!itemRef.current) return;
    
    const rect = itemRef.current.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    
    if (e.clientY < midpoint) {
      setDropPosition('above');
    } else {
      setDropPosition('below');
    }
  };

  const handleDragLeave = () => {
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const toIndex = dropPosition === 'above' ? index : index + 1;
    onDrop(draggedIndex, toIndex);
    setDropPosition(null);
  };

  return (
    <div
      ref={itemRef}
      className="relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Indicator Above */}
      {dropPosition === 'above' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#CCAA4C] z-10 -translate-y-1/2" />
      )}

      <div
        className={`flex items-center gap-4 bg-[#252219] border-2 border-[#AEACA1]/20 p-4 transition-opacity ${
          isDragging ? "opacity-50 border-[#CCAA4C]" : ""
        }`}
      >
        {/* Drag Handle */}
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="cursor-grab active:cursor-grabbing p-2 text-[#AEACA1] hover:text-white"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Image */}
        {item.image && (
          <div className="w-16 h-16 bg-[#1f1c13] border border-[#AEACA1]/20 overflow-hidden shrink-0">
            <img src={item.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{item.title}</h3>
          {item.subtitle && (
            <p className="text-sm text-[#AEACA1] truncate">{item.subtitle}</p>
          )}
        </div>

        {/* Status Badge */}
        {item.status && (
          <span
            className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
              item.status === "published"
                ? "bg-green-500/20 text-green-400"
                : item.status === "draft"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {item.status}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(item.id)}
              className="p-2 text-[#AEACA1] hover:text-[#CCAA4C] transition-colors"
              title={item.status === "published" ? "Unpublish" : "Publish"}
            >
              {item.status === "published" ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={() => onEdit(item.id)}
            className="p-2 text-[#AEACA1] hover:text-[#CCAA4C] transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-[#AEACA1] hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drop Indicator Below */}
      {dropPosition === 'below' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#CCAA4C] z-10 translate-y-1/2" />
      )}
    </div>
  );
}

// Helper function to reorder array
function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  // Adjust endIndex if we're moving down
  const adjustedEndIndex = startIndex < endIndex ? endIndex - 1 : endIndex;
  result.splice(adjustedEndIndex, 0, removed);
  return result;
}

interface DraggableListProps {
  items: Item[];
  onReorder: (items: Item[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

export function DraggableList({
  items,
  onReorder,
  onEdit,
  onDelete,
  onToggleStatus,
}: DraggableListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDrop = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newItems = reorder(items, fromIndex, toIndex);
    onReorder(newItems);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <DraggableItem
          key={item.id}
          item={item}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          draggedIndex={draggedIndex}
        />
      ))}
    </div>
  );
}
