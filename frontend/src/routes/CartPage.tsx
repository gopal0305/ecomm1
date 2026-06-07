import React, { useEffect } from 'react';
import { useAppCart } from '../state/cartState';

export default function CartPage() {
  const { cartItems, cartCount, refreshCart, removeItem, updateQuantity } = useAppCart();

  useEffect(() => {
    refreshCart().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Your Cart ({cartCount})</h1>
      {cartItems.length === 0 ? (
        <div>Your cart is empty.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 680 }}>
          {cartItems.map((it) => (
            <div key={it.productId} style={{ border: '1px solid rgba(255,255,255,0.12)', padding: 12, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontWeight: 800 }}>Product #{it.productId}</div>
              <input
                type="number"
                min={1}
                value={it.quantity}
                onChange={(e) => updateQuantity(it.productId, Number(e.target.value))}
                style={{ width: 90 }}
              />
              <button onClick={() => removeItem(it.productId)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

