import express from 'express';

function getUserId(req) {
  return req.user?.id;
}

export function ordersRoutes({ pool }) {
  const router = express.Router();

  // Checkout: inserts order + order_items. Payment mock is separate.
  router.post('/checkout', async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const { shippingAddress, items } = req.body || {};

      // Prefer cart-driven order if client doesn't send items
      let orderItems = Array.isArray(items) ? items : null;

      if (!orderItems) {
        // Pull from cart_items joined with product price
        const cartRes = await pool.query('SELECT id FROM cart WHERE user_id=$1', [userId]);
        if (!cartRes.rows[0]) return res.status(400).json({ message: 'Cart is empty' });
        const cartId = cartRes.rows[0].id;

        const ciRes = await pool.query(
          `SELECT ci.product_id, ci.quantity, p.price
           FROM cart_items ci
           JOIN products p ON p.id = ci.product_id
           WHERE ci.cart_id=$1`,
          [cartId]
        );
        orderItems = ciRes.rows.map(r => ({ productId: r.product_id, quantity: Number(r.quantity), price: Number(r.price) }));
      }

      if (!shippingAddress) return res.status(400).json({ message: 'shippingAddress required' });
      if (!orderItems?.length) return res.status(400).json({ message: 'No items' });

      const total = orderItems.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0);

      const orderRes = await pool.query(
        `INSERT INTO orders (user_id, shipping_address, status, total)
         VALUES ($1, $2, 'CREATED', $3)
         RETURNING id, status, total, created_at`,
        [userId, shippingAddress, total]
      );

      const orderId = orderRes.rows[0].id;

      for (const it of orderItems) {
        await pool.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, Number(it.productId), Number(it.quantity), Number(it.price)]
        );
      }

      res.json({ orderId, status: 'CREATED', total: Number(total) });
    } catch (e) {
      next(e);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const page = Number(req.query.page ?? 0);
      const size = Number(req.query.size ?? 20);
      const offset = page * size;

      const countRes = await pool.query('SELECT COUNT(*)::int AS cnt FROM orders WHERE user_id=$1', [userId]);
      const total = countRes.rows[0]?.cnt ?? 0;

      const ordersRes = await pool.query(
        `SELECT id, shipping_address, status, total, created_at
         FROM orders
         WHERE user_id=$1
         ORDER BY id DESC
         LIMIT $2 OFFSET $3`,
        [userId, size, offset]
      );

      res.json({
        content: ordersRes.rows.map(r => ({
          id: r.id,
          shippingAddress: r.shipping_address,
          status: r.status,
          total: Number(r.total),
          createdAt: r.created_at,
        })),
        totalElements: total,
        page,
        size,
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
}

