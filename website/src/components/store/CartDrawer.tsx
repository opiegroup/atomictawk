"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useCart, formatPrice } from "@/lib/cart";

export function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeCart();
      }
    };
    if (isOpen) {
      setTimeout(() => document.addEventListener("click", handleClickOutside), 0);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen, closeCart]);

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.variant,
          })),
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-[#252219] border-l-4 border-[#CCAA4C] shadow-2xl flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#AEACA1]/20">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-[#CCAA4C]" />
            <h2
              className="text-xl font-black uppercase tracking-wider text-white"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              Your Cart
            </h2>
            <span className="bg-[#CCAA4C] text-[#353535] px-2 py-0.5 text-xs font-bold">
              {cart.itemCount}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-white/10 transition-colors text-[#AEACA1] hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-[#AEACA1]/30 mb-4" />
              <p className="text-[#AEACA1] font-bold uppercase tracking-wider mb-2">
                Cart Empty
              </p>
              <p className="text-[#AEACA1]/70 text-sm mb-6">
                Add some gear to get started
              </p>
              <Link
                href="/store"
                onClick={closeCart}
                className="bg-[#CCAA4C] text-[#353535] px-6 py-3 font-bold uppercase text-sm hover:bg-white transition-colors"
              >
                Browse Store
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-[#1f1c13] border-2 border-[#AEACA1]/20 p-4"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 bg-[#E8E7DA]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-[#AEACA1]/30" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/store/${item.slug}`}
                      onClick={closeCart}
                      className="text-white font-bold text-sm hover:text-[#CCAA4C] transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="text-[#AEACA1] text-xs mt-0.5">
                        Size: {item.variant}
                      </p>
                    )}
                    <p className="text-[#CCAA4C] font-bold mt-1">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-[#353535] text-white hover:bg-[#CCAA4C] hover:text-[#353535] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-white font-bold text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="w-7 h-7 flex items-center justify-center bg-[#353535] text-white hover:bg-[#CCAA4C] hover:text-[#353535] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1.5 text-[#AEACA1] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="w-full text-[#AEACA1] hover:text-red-400 text-xs font-bold uppercase tracking-wider py-2 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t-2 border-[#AEACA1]/20 p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-[#AEACA1] font-bold uppercase text-sm">Subtotal</span>
              <span className="text-white font-black text-xl">
                {formatPrice(cart.subtotal)}
              </span>
            </div>
            <p className="text-[#AEACA1]/70 text-xs">
              Shipping & taxes calculated at checkout
            </p>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full bg-[#CCAA4C] text-[#353535] py-4 font-black uppercase tracking-wider text-sm hover:bg-white transition-colors flex items-center justify-center gap-2"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Continue Shopping */}
            <Link
              href="/store"
              onClick={closeCart}
              className="block w-full text-center text-[#AEACA1] hover:text-white text-xs font-bold uppercase tracking-wider py-2 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
