import { Hono } from 'hono';
import { Home } from '~/components/pages/Home';
import { session } from '~/middlewares/auth';

export const pageRouter = new Hono().use(session).get('/', (context) => {
	return context.html(Home());
});
