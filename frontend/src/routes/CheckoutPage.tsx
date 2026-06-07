import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setMessage(null);
    try {
      // Mock checkout: payment init + order creation is handled by backend.
      await axios.post('/api/orders/checkout', { address: 'Demo address' });
      navigate('/orders');
    } catch (e: any) {
      setMessage(e?.response?.data?.message ?? e?.message ?? 'Checkout failed');
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Checkout</h1>
      <button onClick={submit}>Place order</button>
      {message && <div style={{ marginTop: 12, color: 'salmon' }}>{message}</div>}
    </div>
  );
}

