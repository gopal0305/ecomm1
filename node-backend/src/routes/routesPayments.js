import express from 'express';

export function paymentsRoutes({ pool }) {
  const router = express.Router();

  router.post('/initiate/:orderId', async (req, res, next) => {
    try {
      const orderId = Number(req.params.orderId);
      if (!Number.isFinite(orderId)) return res.status(400).json({ message: 'Invalid orderId' });

      // Create or update mock payment
      const payRes = await pool.query(
        `INSERT INTO payments (order_id, status, provider, payment_reference)
         VALUES ($1, 'INITIATED', 'MOCK', 'MOCK_REF_' || $1::text)
         ON CONFLICT (order_id)
         DO UPDATE SET status=EXCLUDED.status, provider=EXCLUDED.provider, payment_reference=EXCLUDED.payment_reference,
                       updated_at=NOW()
         RETURNING id, status, provider, payment_reference, created_at`,
        [orderId]
      );

      res.json({
        paymentId: payRes.rows[0].id,
        orderId,
        status: payRes.rows[0].status,
        provider: payRes.rows[0].provider,
        paymentReference: payRes.rows[0].payment_reference,
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
}

