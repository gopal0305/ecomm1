import express from 'express';

function getUserId(req) {
  return req.user?.id;
}

export function wishlistRoutes({ pool }) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const wRes = await pool.query('SELECT id FROM wishlist WHERE user_id=$1', [userId]);
      if (!wRes.rows[0]) return res.json({ items: [], wishlistItems: [] });
      const wishlistId = wRes.rows[0].id;

      const itemsRes = await pool.query(
        `SELECT wi.product_id
         FROM wishlist_items wi
         WHERE wi.wishlist_id=$1`,
        [wishlistId]
      );

      const items = itemsRes.rows.map(r => ({ productId: r.product_id }));
      res.json({ items });
    } catch (e) {
      next(e);
    }
  });

  router.post('/items', async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const { productId } = req.body || {};
      const pid = Number(productId);
      if (!Number.isFinite(pid)) return res.status(400).json({ message: 'Invalid productId' });

      let wRes = await pool.query('SELECT id FROM wishlist WHERE user_id=$1', [userId]);
      if (!wRes.rows[0]) {
        wRes = await pool.query('INSERT INTO wishlist (user_id) VALUES ($1) RETURNING id', [userId]);
      }
      const wishlistId = wRes.rows[0].id;

      await pool.query(
        `INSERT INTO wishlist_items (wishlist_id, product_id)
         VALUES ($1, $2)
         ON CONFLICT (wishlist_id, product_id) DO NOTHING`,
        [wishlistId, pid]
      );

      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  router.delete('/items/:productId', async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const pid = Number(req.params.productId);
      const wRes = await pool.query('SELECT id FROM wishlist WHERE user_id=$1', [userId]);
      if (!wRes.rows[0]) return res.status(204).send();
      const wishlistId = wRes.rows[0].id;

      await pool.query('DELETE FROM wishlist_items WHERE wishlist_id=$1 AND product_id=$2', [wishlistId, pid]);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  });

  return router;
}

