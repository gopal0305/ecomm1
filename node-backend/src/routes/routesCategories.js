import express from 'express';

export function categoryRoutes({ pool }) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const page = Number(req.query.page ?? 0);
      const size = Number(req.query.size ?? 50);
      const offset = page * size;

      const totalRes = await pool.query('SELECT COUNT(*)::int AS cnt FROM categories');
      const total = totalRes.rows[0]?.cnt ?? 0;

      const dataRes = await pool.query(
        `SELECT id, name FROM categories ORDER BY id DESC LIMIT $1 OFFSET $2`,
        [size, offset]
      );

      res.json({
        content: dataRes.rows.map(r => ({ id: r.id, name: r.name })),
        totalElements: total,
        size,
        number: page,
      });
    } catch (e) {
      next(e);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const r = await pool.query('SELECT id, name FROM categories WHERE id=$1', [id]);
      if (!r.rows[0]) return res.status(404).json({ message: 'Category not found' });
      const c = r.rows[0];
      res.json({ id: c.id, name: c.name });
    } catch (e) {
      next(e);
    }
  });

  return router;
}

