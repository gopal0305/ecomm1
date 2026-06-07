-- =========================
-- ecomm schema (PostgreSQL)
-- =========================

-- 1) ENUM-like status fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('CREATED', 'PAID', 'FAILED', 'SHIPPED', 'CANCELED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('INITIATED', 'SUCCESS', 'FAILED');
    END IF;
END$$;

-- 2) USERS / ROLES
CREATE TABLE IF NOT EXISTS roles (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(10) NOT NULL UNIQUE
    -- USER / ADMIN
);

CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    enabled        BOOLEAN NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id   BIGINT NOT NULL,
    role_id   BIGINT NOT NULL,

    PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles (role_id);

-- 3) CATEGORIES / PRODUCTS
CREATE TABLE IF NOT EXISTS categories (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL UNIQUE,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    image_url       TEXT,

    category_id     BIGINT NOT NULL,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);

-- 4) CART / CART_ITEMS
CREATE TABLE IF NOT EXISTS cart (
    id              BIGSERIAL PRIMARY KEY,

    user_id         BIGINT NOT NULL UNIQUE,
    CONSTRAINT fk_cart_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id              BIGSERIAL PRIMARY KEY,

    cart_id         BIGINT NOT NULL,
    product_id      BIGINT NOT NULL,

    quantity        INT NOT NULL CHECK (quantity >= 1),

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,

    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items (cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items (product_id);

-- 5) WISHLIST (with a join table)
CREATE TABLE IF NOT EXISTS wishlist (
    id              BIGSERIAL PRIMARY KEY,

    user_id         BIGINT NOT NULL UNIQUE,
    CONSTRAINT fk_wishlist_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Your JPA mapping uses @ManyToMany join table name wishlist_items
CREATE TABLE IF NOT EXISTS wishlist_items (
    wishlist_id    BIGINT NOT NULL,
    product_id     BIGINT NOT NULL,

    PRIMARY KEY (wishlist_id, product_id),

    CONSTRAINT fk_wishlist_items_wishlist
        FOREIGN KEY (wishlist_id) REFERENCES wishlist(id) ON DELETE CASCADE,

    CONSTRAINT fk_wishlist_items_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON wishlist_items (product_id);

-- 6) ORDERS / ORDER_ITEMS
CREATE TABLE IF NOT EXISTS orders (
    id                      BIGSERIAL PRIMARY KEY,

    user_id                 BIGINT NOT NULL,
    shipping_address       TEXT NOT NULL,
    status                  order_status NOT NULL DEFAULT 'CREATED',
    total                   NUMERIC(12,2) NOT NULL CHECK (total >= 0),

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,

    CONSTRAINT ck_orders_total_nonnegative CHECK (total >= 0)
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at ON orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

CREATE TABLE IF NOT EXISTS order_items (
    id              BIGSERIAL PRIMARY KEY,

    order_id       BIGINT NOT NULL,
    product_id     BIGINT NOT NULL,

    quantity        INT NOT NULL CHECK (quantity >= 1),
    price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items (product_id);

-- 7) PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id                      BIGSERIAL PRIMARY KEY,

    order_id                BIGINT NOT NULL UNIQUE,
    status                  payment_status NOT NULL DEFAULT 'INITIATED',

    provider                VARCHAR(30) NOT NULL DEFAULT 'MOCK',
    payment_reference       TEXT,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,

    CONSTRAINT ck_payment_provider_not_empty CHECK (provider <> '')
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);

