const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    full_name: z.string().min(2).max(150),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refresh_token: z.string().min(1),
  }),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
