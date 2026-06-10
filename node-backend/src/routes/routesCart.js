import express from 'express';

function getUserId(req) {
  return req.user?.id;
}

export function cartRoutes({ pool }) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const cartRes = await pool.query('SELECT id FROM cart WHERE user_id=$1', [userId]);
      if (!cartRes.rows[0]) {
        return res.json({ items: [], cartItems: [] });
      }
      const cartId = cartRes.rows[0].id;

      const itemsRes = await pool.query(
        `SELECT ci.product_id, ci.quantity
         FROM cart_items ci
         WHERE ci.cart_id=$1`,
        [cartId]
      );

      const items = itemsRes.rows.map(r => ({ productId: r.product_id, quantity: Number(r.quantity) }));
      res.json({ items });
    } catch (e) {
      next(e);
    }
  });

  router.post('/items', async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const { productId, quantity } = req.body || {};
      const q = Number(quantity);
      const pid = Number(productId);
      if (!pid || !Number.isFinite(pid) || !q || q < 1) return res.status(400).json({ message: 'Invalid input' });

      let cartRes = await pool.query('SELECT id FROM cart WHERE user_id=$1', [userId]);
      if (!cartRes.rows[0]) {
        cartRes = await pool.query('INSERT INTO cart (user_id) VALUES ($1) RETURNING id', [userId]);
      }
      const cartId = cartRes.rows[0].id;

      await pool.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (cart_id, product_id)
         DO UPDATE SET quantity = EXCLUDED.quantity`,
        [cartId, pid, q]
      );

      const itemsRes = await pool.query(
        `SELECT ci.product_id, ci.quantity
         FROM cart_items ci
         WHERE ci.cart_id=$1`,
        [cartId]
      );

      const items = itemsRes.rows.map(r => ({ productId: r.product_id, quantity: Number(r.quantity) }));
      res.json({ items });
    } catch (e) {
      next(e);
    }
  });

  router.put('/items/:productId', async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const pid = Number(req.params.productId);
      const { quantity } = req.body || {};
      const q = Number(quantity);
      if (!Number.isFinite(q) || q < 1) return res.status(400).json({ message: 'Invalid quantity' });

      const cartRes = await pool.query('SELECT id FROM cart WHERE user_id=$1', [userId]);
      if (!cartRes.rows[0]) return res.status(404).json({ message: 'Cart not found' });
      const cartId = cartRes.rows[0].id;

      await pool.query(
        `UPDATE cart_items SET quantity=$1 WHERE cart_id=$2 AND product_id=$3`,
        [q, cartId, pid]
      );

      const itemsRes = await pool.query(
        `SELECT ci.product_id, ci.quantity
         FROM cart_items ci
         WHERE ci.cart_id=$1`,
        [cartId]
      );

      const items = itemsRes.rows.map(r => ({ productId: r.product_id, quantity: Number(r.quantity) }));
      res.json({ items });
    } catch (e) {
      next(e);
    }
  });

  router.delete('/items/:productId', async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const pid = Number(req.params.productId);
      const cartRes = await pool.query('SELECT id FROM cart WHERE user_id=$1', [userId]);
      if (!cartRes.rows[0]) return res.status(204).send();
      const cartId = cartRes.rows[0].id;

      await pool.query('DELETE FROM cart_items WHERE cart_id=$1 AND product_id=$2', [cartId, pid]);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  });

  return router;
}

