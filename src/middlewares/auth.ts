import { deleteCookie, getCookie } from 'hono/cookie';
import { createFactory } from 'hono/factory';

const factory = createFactory();

export const session = factory.createMiddleware(async (context, next) => {
	const accessToken = getCookie(context, 'access_token');

	if (!accessToken) {
		deleteCookie(context, 'access_token');
		return context.redirect('/auth/login', 302);
	}

	const response = await fetch(
		'https://sso2.pea.co.th/realms/pea-users/protocol/openid-connect/userinfo',
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}
	);

	if (!response.ok) {
		deleteCookie(context, 'access_token');
		return context.redirect('/auth/login', 302);
	}

	return await next();
});
