import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import CartSidebar from '../cart/CartSidebar';
import { useAppCart } from '../../state/cartState';

export default function Layout() {
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount } = useAppCart();

  useEffect(() => {
    // Keep sidebar state stable across navigation if desired.
  }, []);

  return (
    <div className="appRoot">
      <TopNav cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <main className="pageMain">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footerGrid">
            <div>
              <div className="footerTitle">E-commerce</div>
              <div className="footerText">Demo full-stack application.</div>
            </div>
            <div>
              <div className="footerTitle">Quick links</div>
              <div className="footerLinks">
                <Link className="footerLink" to="/products">Products</Link>
                <Link className="footerLink" to="/orders">Orders</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

