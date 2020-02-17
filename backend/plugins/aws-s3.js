/**
 * Fastify plugin attaches AWS S3 object to fastify
 */

const AWS = require('aws-sdk');
const fastifyPlugin = require('fastify-plugin');

async function awsS3(fastify, options) {
	// set the region 
	AWS.config.update({region: process.env.AWS_S3_REGION});
	// create S3 service object
	const s3 = new AWS.S3({apiVersion: '2006-03-01'});
	// attach aws s3 to fastify
	fastify.decorate('aws_s3', s3);
}

// Wrapping a plugin function with fastify-plugin exposes the decorators,
// hooks, and middlewares declared inside the plugin to the parent scope.
module.exports = fastifyPlugin(awsS3);
