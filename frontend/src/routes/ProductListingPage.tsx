import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';

type Product = {
  id: number;
  name?: string;
  title?: string;
  price?: number;
  imageUrl?: string;
};

export default function ProductListingPage() {
  const location = useLocation();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') ?? undefined;
    axios
      .get('/api/products', { params: { search, page: 0, size: 12 } })
      .then((res) => {
        const data: any = res.data;
        const content = data?.content ?? [];
        setItems(content);
      })
      .catch(() => setItems([]));
  }, [location.search]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Products</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {items.map((p: any) => (
          <Link key={p.id} to={`/products/${p.id}`} style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: 14 }}>
            <div style={{ fontWeight: 800 }}>{p.name ?? p.title ?? 'Product'}</div>
            <div style={{ opacity: 0.8, marginTop: 6 }}>${p.price ?? ''}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

