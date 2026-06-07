import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get('/api/orders')
      .then((res) => {
        const data: any = res.data;
        setOrders(Array.isArray(data) ? data : data?.content ?? []);
      })
      .catch(() => setOrders([]));
  }, []);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Orders</h1>
      {orders.length === 0 ? (
        <div>No orders yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map((o) => (
            <div key={o.id} style={{ border: '1px solid rgba(255,255,255,0.12)', padding: 12, borderRadius: 14 }}>
              <div style={{ fontWeight: 900 }}>Order #{o.id}</div>
              <div style={{ opacity: 0.85 }}>Status: {o.status ?? ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

