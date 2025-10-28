import z from 'zod';
import redisClient from './../../utils/redis';

export const schema = z.object({
  name: z
    .string()
    .min(2, 'Name should be at least 2 characters')
    .max(50, 'Name should be at most 50 characters'),

  email: z
    .string()
    .email('Invalid email address')
    .max(100, 'Email should be at most 100 characters'),
  password: z
    .string()
    .min(6, 'Password should be at least 6 characters')
    .max(100, 'Password should be at most 100 characters'),
});

const create = z.object({
  body: schema,
});

const update = z.object({
  body: schema.partial(),
});

const login = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email address')
      .max(100, 'Email should be at most 100 characters'),
    password: z
      .string()
      .min(6, 'Password should be at least 6 characters')
      .max(100, 'Password should be at most 100 characters'),
  }),
});

export const UserValidator = {
  create,
  update,
  login,
};
