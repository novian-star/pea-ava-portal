import { Hono } from 'hono';
import { authRouter } from '~/routers/auth';
import { pageRouter } from '~/routers/pages';

export const router = new Hono().route('/', authRouter).route('/', pageRouter);
