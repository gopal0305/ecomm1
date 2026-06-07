import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export type CartItem = {
  productId: number;
  quantity: number;
};

type CartContextValue = {
  cartCount: number;
  cartItems: CartItem[];
  refreshCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function safeNumber(v: any): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function fetchCart(): Promise<CartItem[]> {
  const res = await axios.get('/api/cart');
  // Backend response shape is CartDtos.CartResponse; we don't depend on exact names here.
  const data: any = res.data;

  if (Array.isArray(data?.items)) {
    return data.items.map((it: any) => ({
      productId: safeNumber(it.productId ?? it.id ?? it.product_id),
      quantity: safeNumber(it.quantity),
    }));
  }

  if (Array.isArray(data?.cartItems)) {
    return data.cartItems.map((it: any) => ({
      productId: safeNumber(it.productId ?? it.id ?? it.product_id),
      quantity: safeNumber(it.quantity),
    }));
  }

  return [];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartCount = useMemo(() => cartItems.reduce((sum, it) => sum + it.quantity, 0), [cartItems]);

  const refreshCart = async () => {
    const items = await fetchCart();
    setCartItems(items);
  };

  useEffect(() => {
    // Best-effort initial load (no auth gating here; backend will respond appropriately).
    refreshCart().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addItem = async (productId: number, quantity: number) => {
    await axios.post('/api/cart/items', { productId, quantity });
    await refreshCart();
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    await axios.put(`/api/cart/items/${productId}`, { quantity });
    await refreshCart();
  };

  const removeItem = async (productId: number) => {
    await axios.delete(`/api/cart/items/${productId}`);
    await refreshCart();
  };

  const value = useMemo<CartContextValue>(
    () => ({ cartCount, cartItems, refreshCart, addItem, updateQuantity, removeItem }),
    [cartCount, cartItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useAppCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useAppCart must be used within CartProvider');
  return ctx;
}

