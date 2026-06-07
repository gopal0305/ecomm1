import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../ui/Layout/Layout';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import ProductListingPage from './ProductListingPage';
import ProductDetailsPage from './ProductDetailsPage';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import OrdersPage from './OrdersPage';
import AdminDashboardPage from './AdminDashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/products" element={<ProductListingPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

