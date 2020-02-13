// read ENV variables
require('dotenv').config();

const oauthPlugin = require('fastify-oauth2');

// initialize fastify instance
const fastify = require('fastify')({ logger: true });

// connect to Mongo DB
fastify.register(require('../plugins/mongo-connector'), {
	url: process.env.MONGO_DB_CONNECTION
});

// initialize OAuth
fastify.register(oauthPlugin, {
	name: 'googleOAuth2',
	scope: ['email'],
	credentials: {
	  client: {
		id: process.env.OAUTH_GOOGLE_CLIENT_ID,
		secret: process.env.OAUTH_GOOGLE_CLIENT_SECRET
	  },
	  auth: oauthPlugin.GOOGLE_CONFIGURATION
	},
	// register a fastify url to start the redirect flow
	startRedirectPath: '/api/v1/auth/google',
	// google redirects here after the user login
	callbackUri: `${process.env.API_URL}/api/v1/auth/google/callback`
});

// initialize JWT auth
fastify.register(require('../plugins/jwt-auth'));

// attach APIs
fastify.register(require('../routes/v1/auth'), { prefix: '/api/v1' }); // auth API
fastify.register(require('../routes/v1/users'), { prefix: '/api/v1' }); // users API
  
// default route
fastify.get('/', function (request, reply) {
	reply.send('React Native Version Admin works');
});

// run the server
fastify.listen(process.env.PORT, function (err, address) {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	fastify.log.info(`server listening on ${address}`);
});
