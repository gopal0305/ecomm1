import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Welcome</h1>
      <p style={{ opacity: 0.85 }}>Browse products and place an order.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/products">Go to products</Link>
        <Link to="/orders">View orders</Link>
      </div>
    </div>
  );
}

