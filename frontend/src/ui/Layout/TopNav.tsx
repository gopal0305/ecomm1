import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../state/authState';

type Props = {
  cartCount: number;
  onOpenCart: () => void;
};

export default function TopNav({ cartCount, onOpenCart }: Props) {
  const [query, setQuery] = React.useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate(`/products?search=${encodeURIComponent(q)}`);
    setMobileMenuOpen(false);
  }

  return (
    <header className="topNav">
      <div className="container topNavInner">
        <div className="brandRow">
          <button
            className="mobileOnly iconBtn"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen((s) => !s)}
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="brand">
            <span className="brandMark">🛍️</span>
            <span className="brandText">E-commerce</span>
          </Link>
        </div>

        <form className="searchForm" onSubmit={submitSearch}>
          <div className="searchInputWrap">
            <Search className="searchIcon" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="searchInput"
              placeholder="Search products..."
            />
          </div>
          <button className="searchBtn" type="submit">Search</button>
        </form>

        <div className="navActions">
          <button className="cartBtn" onClick={onOpenCart} aria-label="Open cart">
            <ShoppingCart size={18} />
            {cartCount > 0 && <span className="cartBadge">{cartCount}</span>}
          </button>

          {token ? (
            <button
              className="linkBtn"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </button>
          ) : (
            <Link className="linkBtn" to="/login">Login</Link>
          )}
        </div>

        {mobileMenuOpen && (
          <div className="mobileMenu mobileOnly">
            <Link className="mobileMenuLink" to="/products" onClick={() => setMobileMenuOpen(false)}>
              Products
            </Link>
            <Link className="mobileMenuLink" to="/orders" onClick={() => setMobileMenuOpen(false)}>
              Orders
            </Link>
            <Link className="mobileMenuLink" to="/admin" onClick={() => setMobileMenuOpen(false)}>
              Admin
            </Link>
          </div>
        )}
      </div>

      <div className="container desktopOnly navLinks">
        <Link className="navLink" to="/products">Shop</Link>
        <Link className="navLink" to="/orders">Orders</Link>
        <Link className="navLink" to="/admin">Admin</Link>
      </div>
    </header>
  );
}

