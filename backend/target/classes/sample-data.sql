-- Sample data for quick start (optional; JPA will create/update schema)
-- Users
INSERT INTO roles (id, name)
VALUES (1, 'USER')
ON CONFLICT (id) DO NOTHING;

INSERT INTO roles (id, name)
VALUES (2, 'ADMIN')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, enabled)
VALUES (1, 'user@example.com', '$2a$10$abcdefghijklmnopqrstuv12345678901234567890123456', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users_roles (user_id, role_id)
VALUES (1, 1)
ON CONFLICT DO NOTHING;

INSERT INTO users (id, email, password_hash, enabled)
VALUES (2, 'admin@example.com', '$2a$10$abcdefghijklmnopqrstuv12345678901234567890123456', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users_roles (user_id, role_id)
VALUES (2, 2)
ON CONFLICT DO NOTHING;

-- Categories
INSERT INTO categories (id, name)
VALUES (1, 'Electronics')
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, name)
VALUES (2, 'Home & Kitchen')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (id, name, description, price, image_url, category_id)
VALUES (1, 'Wireless Headphones', 'Noise-cancelling over-ear headphones', 99.99, 'https://via.placeholder.com/600x600.png?text=Headphones', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, description, price, image_url, category_id)
VALUES (2, 'Air Fryer', 'Crispy results with less oil', 79.50, 'https://via.placeholder.com/600x600.png?text=Air+Fryer', 2)
ON CONFLICT (id) DO NOTHING;

