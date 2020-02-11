// read ENV variables
require('dotenv').config();

// initialize fastify instance
const fastify = require('fastify')({ logger: true });

// connect to Mongo DB
fastify.register(require('../plugins/mongo-connector'), {
	url: process.env.MONGO_DB_CONNECTION
});

// attach APIs
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
