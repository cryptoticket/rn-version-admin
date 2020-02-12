/**
 * Fastify plugin that attaches mongo DB connection
 */

const fastifyPlugin = require('fastify-plugin');
const mongoose = require('mongoose');

// attach model schemas
require('../db/models/user');

async function mongoConnector(fastify, options) {
	const url = options.url;
	delete options.url;
	// create db connection
	const db = await mongoose.createConnection(url, { 
		useNewUrlParser: true, 
		useUnifiedTopology: true,
		useFindAndModify: false
	});
	// attach mongo to fastify
	fastify.decorate('mongo', db);
}

// Wrapping a plugin function with fastify-plugin exposes the decorators,
// hooks, and middlewares declared inside the plugin to the parent scope.
module.exports = fastifyPlugin(mongoConnector);
