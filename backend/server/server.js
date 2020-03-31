// read ENV variables
require('dotenv').config();

const oauthPlugin = require('fastify-oauth2');
const path = require('path');

// initialize fastify instance
const fastify = require('fastify')({ logger: true });

// add ETAG headers to request for caching support
fastify.register(require('fastify-etag'));

// initialize plugin for file uploads
fastify.register(require('fastify-multipart'), { 
	addToBody: true,
	sharedSchemaId: 'MultipartFileType' 
});

// connect to Mongo DB
fastify.register(require('../plugins/mongo-connector'), { url: process.env.MONGO_DB_CONNECTION });

// run DB migration with initial data
fastify.register(require('../plugins/initial-migration'));

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

// initialize AWS S3
fastify.register(require('../plugins/aws-s3'));

// attach APIs
fastify.register(require('../routes/v1/auth'), { prefix: '/api/v1' }); // auth API
fastify.register(require('../routes/v1/bundles'), { prefix: '/api/v1' }); // bundles API
fastify.register(require('../routes/v1/users'), { prefix: '/api/v1' }); // users API

// serve web app
fastify.register(require('fastify-static'), {
	root: path.join(__dirname, '../../build'),
	prefix: '/'
});

// serve static bundles
fastify.get('/static/bundles/:version/:filename', {
	schema: {
		params: {
			type: 'object',
			required: ['filename'],
			properties: {
				version: {
					type: 'string',
					pattern: '^(\\d+\\.)?(\\d+\\.)?(\\*|\\d+)$'
				},
				filename: {
					type: 'string',
					enum: ['android.bundle.zip', 'ios.bundle.zip']
				}
			}
		}
	}
}, function (request, reply) {
	reply.sendFile(`${request.params.version}/${request.params.filename}`, path.join(__dirname, '../static/bundles'));
});

// run the server
fastify.listen(process.env.PORT, function (err, address) {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	fastify.log.info(`server listening on ${address}`);
});

module.exports = fastify;
