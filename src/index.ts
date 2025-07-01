import { Hono } from 'hono';
import { router } from '~/routers';

const app = new Hono().route('/', router);

const server = Bun.serve({
	fetch: app.fetch,
});

console.log('Server is running on port', server.port);
