import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAppCart } from '../state/cartState';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const { addItem } = useAppCart();

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null));
  }, [id]);

  async function addToCart() {
    if (!product?.id) return;
    await addItem(Number(product.id), qty);
  }

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>{product.name ?? product.title}</h1>
      <p style={{ opacity: 0.85 }}>{product.description ?? ''}</p>
      <div style={{ fontWeight: 900 }}>${product.price ?? ''}</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
        <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} style={{ width: 90 }} />
        <button onClick={addToCart}>Add to cart</button>
      </div>
    </div>
  );
}

