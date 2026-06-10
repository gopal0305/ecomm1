import { authRoutes } from './routesAuth.js';
import { productRoutes } from './routesProducts.js';
import { categoryRoutes } from './routesCategories.js';
import { cartRoutes } from './routesCart.js';
import { wishlistRoutes } from './routesWishlist.js';
import { ordersRoutes } from './routesOrders.js';
import { paymentsRoutes } from './routesPayments.js';
import { adminProductRoutes } from './routesAdminProducts.js';

export function registerRoutes({ app, pool, jwtAuth }) {
  // auth (public)
  app.use('/api/auth', authRoutes({ pool }));

  // public
  app.use('/api/products', productRoutes({ pool }));
  app.use('/api/categories', categoryRoutes({ pool }));

  // protected
  app.use('/api/cart', jwtAuth.auth, cartRoutes({ pool }));
  app.use('/api/wishlist', jwtAuth.auth, wishlistRoutes({ pool }));
  app.use('/api/orders', jwtAuth.auth, ordersRoutes({ pool }));
  app.use('/api/payments', jwtAuth.auth, paymentsRoutes({ pool }));

  // admin
  app.use('/api/admin/products', jwtAuth.auth, jwtAuth.requireAdmin, adminProductRoutes({ pool }));
}

