import express from 'express';

export function adminProductRoutes({ pool }) {
  const router = express.Router();

  router.post('/', async (req, res, next) => {
    try {
      const { name, description, price, imageUrl, categoryId } = req.body || {};
      if (!name || categoryId === undefined || price === undefined) return res.status(400).json({ message: 'Missing fields' });

      const created = await pool.query(
        `INSERT INTO products (name, description, price, image_url, category_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, description, price, image_url, category_id`,
        [name, description ?? null, Number(price), imageUrl ?? null, Number(categoryId)]
      );

      res.json({
        id: created.rows[0].id,
        name: created.rows[0].name,
        description: created.rows[0].description,
        price: Number(created.rows[0].price),
        imageUrl: created.rows[0].image_url,
        categoryId: created.rows[0].category_id,
      });
    } catch (e) {
      next(e);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { name, description, price, imageUrl, categoryId } = req.body || {};
      const updated = await pool.query(
        `UPDATE products
         SET name=$1,
             description=$2,
             price=$3,
             image_url=$4,
             category_id=$5,
             updated_at=NOW()
         WHERE id=$6
         RETURNING id, name, description, price, image_url, category_id`,
        [name, description ?? null, Number(price), imageUrl ?? null, Number(categoryId), id]
      );

      if (!updated.rows[0]) return res.status(404).json({ message: 'Product not found' });

      res.json({
        id: updated.rows[0].id,
        name: updated.rows[0].name,
        description: updated.rows[0].description,
        price: Number(updated.rows[0].price),
        imageUrl: updated.rows[0].image_url,
        categoryId: updated.rows[0].category_id,
      });
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await pool.query('DELETE FROM products WHERE id=$1', [id]);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  });

  return router;
}

