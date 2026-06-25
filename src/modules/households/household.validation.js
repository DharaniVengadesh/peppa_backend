const { z } = require('zod');

const createHouseholdSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150),
  }),
});

const inviteSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const joinSchema = z.object({
  body: z.object({
    invite_code: z.string().min(6).max(12),
  }),
});

const cuisinesSchema = z.object({
  body: z.object({
    cuisine_ids: z.array(z.string().uuid()).min(1).max(10),
  }),
});

const memberSchema = z.object({
  body: z.object({
    display_name: z.string().min(1).max(100),
    relationship: z.string().max(50).optional(),
    age: z.number().int().min(0).max(120).optional(),
    diet_type: z.enum(['vegetarian', 'vegan', 'omnivore', 'pescatarian']).optional(),
    allergies: z.array(z.string()).optional(),
    restrictions: z.array(z.string()).optional(),
    health_goals: z.array(z.any()).optional(),
    deficiencies: z.array(z.any()).optional(),
    bmi: z.number().optional(),
    calorie_target: z.number().int().optional(),
    protein_target_g: z.number().int().optional(),
  }),
});

module.exports = {
  createHouseholdSchema,
  inviteSchema,
  joinSchema,
  cuisinesSchema,
  memberSchema,
};
