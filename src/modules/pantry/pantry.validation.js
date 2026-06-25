const { z } = require('zod');

const pantryItemSchema = z.object({
  body: z.object({
    grocery_catalog_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit: z.string().max(20).optional(),
    location: z.enum(['pantry', 'refrigerator', 'freezer', 'counter']).optional(),
    expiry_date: z.string().optional(),
    purchase_date: z.string().optional(),
    low_stock_threshold: z.number().optional(),
    notes: z.string().max(500).optional(),
  }),
});

module.exports = { pantryItemSchema };
