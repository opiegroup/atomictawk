"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

// Types
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string; // e.g., "L" for size
  maxStock: number;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

interface CartContextType {
  cart: Cart;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string, variant?: string) => number;
}

const CART_STORAGE_KEY = "atomic-tawk-cart";

// Initial empty cart
const emptyCart: Cart = {
  items: [],
  itemCount: 0,
  subtotal: 0,
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to generate unique item ID
function generateItemId(productId: string, variant?: string): string {
  return variant ? `${productId}-${variant}` : productId;
}

// Calculate cart totals
function calculateCart(items: CartItem[]): Cart {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, itemCount, subtotal };
}

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as CartItem[];
        setCart(calculateCart(items));
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage when items change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
      } catch (error) {
        console.error("Failed to save cart:", error);
      }
    }
  }, [cart.items, isLoading]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback((newItem: Omit<CartItem, "id">) => {
    setCart((prev) => {
      const itemId = generateItemId(newItem.productId, newItem.variant);
      const existingIndex = prev.items.findIndex((item) => item.id === itemId);

      let updatedItems: CartItem[];

      if (existingIndex >= 0) {
        // Update existing item quantity
        updatedItems = prev.items.map((item, index) => {
          if (index === existingIndex) {
            const newQuantity = Math.min(item.quantity + newItem.quantity, item.maxStock);
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
      } else {
        // Add new item
        updatedItems = [...prev.items, { ...newItem, id: itemId }];
      }

      return calculateCart(updatedItems);
    });

    // Open cart drawer when item is added
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCart((prev) => {
      const updatedItems = prev.items.filter((item) => item.id !== itemId);
      return calculateCart(updatedItems);
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        const updatedItems = prev.items.filter((item) => item.id !== itemId);
        return calculateCart(updatedItems);
      }

      const updatedItems = prev.items.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.min(quantity, item.maxStock);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      return calculateCart(updatedItems);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart(emptyCart);
  }, []);

  const getItemQuantity = useCallback(
    (productId: string, variant?: string): number => {
      const itemId = generateItemId(productId, variant);
      const item = cart.items.find((item) => item.id === itemId);
      return item?.quantity || 0;
    },
    [cart.items]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isLoading,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Format price helper
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100);
}
