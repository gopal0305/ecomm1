import React from 'react';
import { useAppCart } from '../../state/cartState';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CartSidebar({ open, onClose }: Props) {
  const { cartItems, cartCount, updateQuantity, removeItem, refreshCart } = useAppCart();

  React.useEffect(() => {
    if (open) {
      refreshCart().catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 40,
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 360,
          background: '#0b0f14',
          borderLeft: '1px solid rgba(255,255,255,0.12)',
          transform: open ? 'translateX(0)' : 'translateX(110%)',
          transition: 'transform 160ms ease',
          zIndex: 50,
          padding: 16,
          overflow: 'auto',
        }}
        aria-hidden={!open}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Cart</div>
            <div style={{ opacity: 0.85, marginTop: 2 }}>{cartCount} items</div>
          </div>
          <button onClick={onClose} style={{ cursor: 'pointer' }}>
            Close
          </button>
        </div>


        <div style={{ marginTop: 14 }}>
          {cartItems.length === 0 ? (
            <div style={{ opacity: 0.85 }}>Your cart is empty.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cartItems.map((it) => (
                <div
                  key={it.productId}
                  style={{
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>Product #{it.productId}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                    <input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) => updateQuantity(it.productId, Number(e.target.value))}
                      style={{ width: 90 }}
                    />
                    <button onClick={() => removeItem(it.productId)} style={{ cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

        {/* Keep space for potential checkout button */}
        <div style={{ marginTop: 16, opacity: 0.75, fontSize: 12 }}>
          {cartItems.length > 0 ? 'Proceed to checkout from the cart page.' : null}
        </div>
      </aside>
    </>
  );
}
