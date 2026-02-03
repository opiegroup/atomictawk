"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

export function CartIcon() {
  const { cart, toggleCart, isLoading } = useCart();

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 text-[#353535] hover:text-[#CCAA4C] transition-colors"
      aria-label={`Shopping cart with ${cart.itemCount} items`}
    >
      <ShoppingCart className="w-6 h-6" strokeWidth={2.5} />
      {!isLoading && cart.itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white text-xs font-bold w-5 h-5 flex items-center justify-center">
          {cart.itemCount > 9 ? "9+" : cart.itemCount}
        </span>
      )}
    </button>
  );
}
