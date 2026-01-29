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
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

function DraggableItem({ item, onEdit, onDelete, onToggleStatus }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 bg-[#252219] border-2 border-[#AEACA1]/20 p-4 ${
        isDragging ? "opacity-50 border-[#CCAA4C]" : ""
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 text-[#AEACA1] hover:text-white"
      >
        <GripVertical className="w-5 h-5" />
      </button>

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
  );
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
