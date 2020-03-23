/**
 * Auth API
 */

const axios = require('axios');

async function routes(fastify, options) {

	const User = fastify.mongo.model('User');

	/**
	 * Gate (3rd party oauth service) should redirect here after auth
	 */
	fastify.get('/auth/gate/callback', async function (request, reply) {
		// check that JWT token exists
		const jwtTokenFromGate = request.query['token'];
		if(!jwtTokenFromGate) throw new Error('JWT token was not found in query params');
		// check that token is valid
		const jwtTokenDecoded = fastify.jwt.verify(jwtTokenFromGate);
		// check that user has admin rights
		if(!jwtTokenDecoded['is_manager']) throw new Error('User has not enough permissions');
		// check that email exists
		if(!jwtTokenDecoded['email']) throw new Error('Email was not received from gate service');
		// if user does not exist in DB then throw error
		const user = await User.findOne({email: jwtTokenDecoded['email']});
		if(!user) throw new Error('User with this email was not found');
		// redirect user to home page with JWT in url
		const jwtToken = fastify.jwt.sign({id: user.id, email: user.email});
		reply.redirect(`/?token=${jwtToken}`);
	});

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
		const jwtToken = fastify.jwt.sign({id: user.id, email: user.email});
		reply.redirect(`/?token=${jwtToken}`);
	});

}

module.exports = routes;
