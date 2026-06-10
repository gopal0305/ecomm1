import express from 'express';

export function productRoutes({ pool }) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const { categoryId, search, minPrice, maxPrice, page = '0', size = '12' } = req.query;
      const p = Number(page);
      const s = Number(size);
      const offset = p * s;

      const where = [];
      const params = [];

      if (categoryId !== undefined) {
        where.push(`p.category_id = $${params.length + 1}`);
        params.push(Number(categoryId));
      }

      if (search) {
        where.push(`(p.name ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`);
        params.push(`%${String(search)}%`);
      }

      if (minPrice !== undefined) {
        where.push(`p.price >= $${params.length + 1}`);
        params.push(Number(minPrice));
      }

      if (maxPrice !== undefined) {
        where.push(`p.price <= $${params.length + 1}`);
        params.push(Number(maxPrice));
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const countRes = await pool.query(
        `SELECT COUNT(*)::int AS cnt FROM products p ${whereSql}`,
        params
      );
      const total = countRes.rows[0]?.cnt ?? 0;

      const dataRes = await pool.query(
        `SELECT p.id, p.name, p.description, p.price, p.image_url, c.id AS category_id, c.name AS category_name
         FROM products p
         JOIN categories c ON c.id = p.category_id
         ${whereSql}
         ORDER BY p.id DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, s, offset]
      );

      // Spring Page shape used by frontend might be {content, totalElements, ...}
      return res.json({
        content: dataRes.rows.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          price: Number(r.price),
          imageUrl: r.image_url,
          category: { id: r.category_id, name: r.category_name },
        })),
        totalElements: total,
        size: s,
        number: p,
      });
    } catch (e) {
      next(e);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const r = await pool.query(
        `SELECT p.id, p.name, p.description, p.price, p.image_url,
                c.id AS category_id, c.name AS category_name
         FROM products p JOIN categories c ON c.id = p.category_id
         WHERE p.id = $1`,
        [id]
      );
      if (!r.rows[0]) return res.status(404).json({ message: 'Product not found' });
      const p = r.rows[0];
      res.json({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        imageUrl: p.image_url,
        category: { id: p.category_id, name: p.category_name },
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
}

