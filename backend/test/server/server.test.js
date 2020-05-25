const assert = require('assert');
const fs = require('fs');
const request = require('supertest');

let fastify = require('../../server/server');

describe('server API tests', () => {

	before(async () => {
		// wait for fastify to be initialized
		await fastify.ready();
	});

	describe('GET /', () => {
		it('should return 200 with frontend html', () => {
			return request(fastify.server)
				.get('/')
				.expect(200);
		});
	});

	describe('GET /metrics', () => {
		it('should return 200 with metrics', () => {
			return request(fastify.server)
				.get('/metrics')
				.expect(200);
		});
	});

	describe('GET /static/bundles/:version/:filename', () => {
		it('should return 400 error if version is invalid', () => {
			return request(fastify.server)
				.get(`/static/bundles/INVALID/android.bundle.zip`)
				.expect((resp) => {
					assert.equal(resp.body.message, 'params.version should match pattern "^(\\d+\\.)?(\\d+\\.)?(\\*|\\d+)$"');
				})
				.expect(400);
		});

		it('should return 400 error if filename is invalid', () => {
			return request(fastify.server)
				.get(`/static/bundles/1.0.0/INVALID.bundle.zip`)
				.expect((resp) => {
					assert.equal(resp.body.message, 'params.filename should be equal to one of the allowed values');
				})
				.expect(400);
		});

		it('should return 404 error if bundle was not found', () => {
			return request(fastify.server)
				.get(`/static/bundles/1.0.0/android.bundle.zip`)
				.expect(404);
		});

		it('should return 200 and bundle file', async () => {
			// create bundle
			fs.mkdirSync(`${__dirname}/../../static/bundles/1.0.0`);
			fs.copyFileSync(__filename, `${__dirname}/../../static/bundles/1.0.0/android.bundle.zip`);
			// get bundle
			return request(fastify.server)
				.get(`/static/bundles/1.0.0/android.bundle.zip`)
				.expect(200)
				.then(() => {
					fs.unlinkSync(`${__dirname}/../../static/bundles/1.0.0/android.bundle.zip`);
					fs.rmdirSync(`${__dirname}/../../static/bundles/1.0.0`);
				});
		});
	});

});
