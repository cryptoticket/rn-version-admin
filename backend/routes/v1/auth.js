/**
 * Auth API
 */

const axios = require('axios');

async function routes(fastify, options) {

	const User = fastify.mongo.model('User');

	/**
	 * Google redirects here after auth
	 */
	fastify.get('/auth/google/callback', async function (request, reply) {
		// get google access token
		const token = await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
		// get user info by google access token
		const resp = await axios.get('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				'Authorization': `Bearer ${token.access_token}`
			},
		});
		// check that email exists
		if(!resp.data.email) throw new Error('Email was not received from Google OAuth');
		// if user does not exist in DB then throw error
		const user = await User.findOne({email: resp.data.email});
		if(!user) throw new Error('User with this email was not found');
		// redirect user to home page with JWT in url
		// TODO: !
		reply.send({ access_token: token.access_token })
	});

}

module.exports = routes;
