import { Hono } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { AUTH_CONFIG } from '~/confs/auth';
import { generateState } from '~/utils/auth';

export const authRouter = new Hono()

	.basePath('/auth')

	.get('/', (c) => {
		return c.redirect(
			'https://sso2.pea.co.th/realms/pea-users/.well-known/openid-configuration',
			302
		);
	})

	.get('/login', (c) => {
		const url = new URL(
			'https://sso2.pea.co.th/realms/pea-users/protocol/openid-connect/auth'
		);

		const { CLIENT_ID, REDIRECT_URI } = AUTH_CONFIG;
		if (!CLIENT_ID || !REDIRECT_URI) {
			return c.text('Client ID or Redirect URI is not configured', 500);
		}
		const state = generateState();

		url.searchParams.set('response_type', 'code');
		url.searchParams.set('scope', 'openid profile email');
		url.searchParams.set('client_id', CLIENT_ID);
		url.searchParams.set('redirect_uri', REDIRECT_URI);
		url.searchParams.set('state', state);

		setCookie(c, 'state', state, {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
		});

		return c.redirect(url.toString(), 302);
	})

	.get('/callback', async (c) => {
		const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = AUTH_CONFIG;
		if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
			return c.text(
				'Client ID, Client Secret or Redirect URI is not configured',
				500
			);
		}

		const code = c.req.query('code');
		const sessionState = c.req.query('session_state');
		const state = getCookie(c, 'state');

		if (!code || !sessionState || !state) {
			return c.text('Missing code or state', 400);
		}

		if (state !== getCookie(c, 'state')) {
			return c.text('State mismatch', 400);
		}

		deleteCookie(c, 'state');

		const response = await fetch(
			'https://sso2.pea.co.th/realms/pea-users/protocol/openid-connect/token',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					grant_type: 'authorization_code',
					code,
					redirect_uri: REDIRECT_URI,
					client_id: CLIENT_ID,
					client_secret: CLIENT_SECRET,
				}),
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			return c.text(`Error fetching token: ${errorText}`, 500);
		}

		const tokenData = (await response.json()) as {
			access_token: string;
			refresh_token: string;
			id_token: string;
			expires_in: number;
			token_type: string;
			session_state: string;
			scope: string;
		};

		setCookie(c, 'access_token', tokenData.access_token, {
			// maxAge: tokenData.expires_in,
			maxAge: 30, // seconds for testing, adjust as needed
			secure: true,
			httpOnly: true,
			sameSite: 'lax',
		});

		return c.redirect('/');
	})

	.get('/logout', (c) => {
		const { REDIRECT_URI } = AUTH_CONFIG;
		if (!REDIRECT_URI) {
			return c.text('Redirect URI is not configured', 500);
		}

		deleteCookie(c, 'access_token');

		const url = new URL(
			'https://sso2.pea.co.th/realms/pea-users/protocol/openid-connect/logout'
		);

		url.searchParams.set('redirect_uri', REDIRECT_URI);

		return c.redirect(url.toString(), 302);
	});
