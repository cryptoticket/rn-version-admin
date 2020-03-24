const assert = require('assert');
const fs = require('fs');
const request = require('supertest');

let fastify = require('../../../server/server');

const ADMIN_EMAIL = 'admin@mail.com';
const API_PREFIX = '/api/v1';

describe('bundles API tests', () => {

	// db models
	let Bundle = null;
	let User = null;

	let admin = null;
	let adminToken = null;

	before(async () => {
		// wait for fastify to be initialized
		await fastify.ready();
		// init db models
		Bundle = fastify.mongo.model('Bundle');
		User = fastify.mongo.model('User');
		// create a temp admin
		admin = new User({email: ADMIN_EMAIL});
		await admin.save();
		// get admin access token
		adminToken = fastify.jwt.sign({id: admin.id, email: ADMIN_EMAIL});
	});

	after(async () => {
		await admin.delete();
	});

	describe('GET /bundles/latest/:platform', () => {
		it('should return 400 error on invalid paltform', () => {
			return request(fastify.server)
				.get(`${API_PREFIX}/bundles/latest/INVALID`)
				.expect((resp) => {
					assert.equal(resp.body.message, 'params.platform should be equal to one of the allowed values');
				})
				.expect(400);
		});

		it('should return 200 and bundle that is required to update', async () => {
			const bundleWithRequiredUpdate = new Bundle({
				platform: 'android',
				version: '1.0.0',
				is_update_required: true,
				url: 'ANY',
				storage: 'file'
			});
			await bundleWithRequiredUpdate.save();
			const bundleWithNotRequiredUpdate = new Bundle({
				platform: 'android',
				version: '1.0.1',
				is_update_required: false,
				url: 'ANY',
				storage: 'file'
			});
			await bundleWithNotRequiredUpdate.save();
			return request(fastify.server)
				.get(`${API_PREFIX}/bundles/latest/android`)
				.expect((resp) => {
					assert.equal(resp.body.version, '1.0.0');
				})
				.expect(200)
				.then(async () => {
					await bundleWithRequiredUpdate.delete();
					await bundleWithNotRequiredUpdate.delete();
				});
		});

		it('should return 200 and bundle with the latest version', async () => {
			const bundleV1 = new Bundle({
				platform: 'android',
				version: '1.0.0',
				is_update_required: false,
				url: 'ANY',
				storage: 'file'
			});
			await bundleV1.save();
			const bundleV2 = new Bundle({
				platform: 'android',
				version: '2.0.0',
				is_update_required: false,
				url: 'ANY',
				storage: 'file'
			});
			await bundleV2.save();
			return request(fastify.server)
				.get(`${API_PREFIX}/bundles/latest/android`)
				.expect((resp) => {
					assert.equal(resp.body.version, '2.0.0');
				})
				.expect(200)
				.then(async () => {
					await bundleV1.delete();
					await bundleV2.delete();
				});
		});

		it('should return 200 and empty response if there are no bundles', async () => {
			return request(fastify.server)
				.get(`${API_PREFIX}/bundles/latest/android`)
				.expect((resp) => {
					assert.deepEqual(resp.body, {});
				})
				.expect(200);
		});
	});

	describe('POST /bundles', () => {
		it('should return 403 error if authorization header does not exist', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.expect((resp) => {
					assert.equal(resp.body.message, 'Autorization header is not set');
				})
				.expect(403);
		});

		it('should return 403 error on invalid api token', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', 'Bearer INVALID')
				.expect((resp) => {
					assert.equal(resp.body.message, 'Invalid api token');
				})
				.expect(403);
		});

		it('should return 400 error if request type is not multipart/form-data', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${admin.api_token}`)
				.expect((resp) => {
					assert.equal(resp.body.message, 'Request is not multipart');
				})
				.expect(400);
		});

		it('should return 400 error if platform is empty', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${admin.api_token}`)
				.field('storage', 'file')
				.field('version', '1.0.0')
				.field('is_update_required', false)
				.attach('bundle', __filename)
				.expect((resp) => {
					assert.equal(resp.body.message, 'body should have required property \'platform\'');
				})
				.expect(400);
		});

		it('should return 400 error if platform is invalid', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${admin.api_token}`)
				.field('platform', 'INVALID')
				.field('storage', 'file')
				.field('version', '1.0.0')
				.field('is_update_required', false)
				.attach('bundle', __filename)
				.expect((resp) => {
					assert.equal(resp.body.message, 'body.platform should be equal to one of the allowed values');
				})
				.expect(400);
		});

		it('should return 400 error if storage is empty', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${admin.api_token}`)
				.field('platform', 'android')
				.field('version', '1.0.0')
				.field('is_update_required', false)
				.attach('bundle', __filename)
				.expect((resp) => {
					assert.equal(resp.body.message, 'body should have required property \'storage\'');
				})
				.expect(400);
		});

		it('should return 400 error if storage is invalid', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${admin.api_token}`)
				.field('platform', 'android')
				.field('storage', 'INVALID')
				.field('version', '1.0.0')
				.field('is_update_required', false)
				.attach('bundle', __filename)
				.expect((resp) => {
					assert.equal(resp.body.message, 'body.storage should be equal to one of the allowed values');
				})
				.expect(400);
		});

		it('should return 400 error if version is empty', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${admin.api_token}`)
				.field('platform', 'android')
				.field('storage', 'file')
				.field('is_update_required', false)
				.attach('bundle', __filename)
				.expect((resp) => {
					assert.equal(resp.body.message, 'body should have required property \'version\'');
				})
				.expect(400);
		});

		it('should return 400 error if version is invalid', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${admin.api_token}`)
				.field('platform', 'android')
				.field('storage', 'file')
				.field('version', 'INVALID')
				.field('is_update_required', false)
				.attach('bundle', __filename)
				.expect((resp) => {
					assert.equal(resp.body.message.indexOf('body.version should match pattern'), 0);
				})
				.expect(400);
		});

		it('should return 400 error if is_update_required field is empty', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${admin.api_token}`)
				.field('platform', 'android')
				.field('storage', 'file')
				.field('version', '1.0.0')
				.attach('bundle', __filename)
				.expect((resp) => {
					assert.equal(resp.body.message, 'body should have required property \'is_update_required\'');
				})
				.expect(400);
		});

		it('should return 400 error if is_update_required field is invalid', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${admin.api_token}`)
				.field('platform', 'android')
				.field('storage', 'file')
				.field('version', '1.0.0')
				.field('is_update_required', 'INVALID')
				.attach('bundle', __filename)
				.expect((resp) => {
					assert.equal(resp.body.message, 'body.is_update_required should be boolean');
				})
				.expect(400);
		});

		it('should return 400 error if bundle is empty', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${admin.api_token}`)
				.field('platform', 'android')
				.field('storage', 'file')
				.field('version', '1.0.0')
				.field('is_update_required', false)
				.attach('bundle', null)
				.expect((resp) => {
					assert.equal(resp.body.message, "body should have required property 'bundle'");
				})
				.expect(400);
		});

		it('should return 400 error if bundle is not a file', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${admin.api_token}`)
				.field('platform', 'android')
				.field('storage', 'file')
				.field('version', '1.0.0')
				.field('is_update_required', false)
				.field('bundle', 'NOT_A_FILE')
				.expect((resp) => {
					assert.equal(resp.body.message, "body.bundle should be array");
				})
				.expect(400);
		});

		it('should return 400 error if bundle for provided platform and version exists', async () => {
			const testBundle = new Bundle({
				platform: 'android',
				version: '1.0.0',
				is_update_required: false,
				url: 'ANY',
				storage: 'file'
			});
			await testBundle.save();
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${admin.api_token}`)
				.field('platform', 'android')
				.field('storage', 'file')
				.field('version', '1.0.0')
				.field('is_update_required', false)
				.attach('bundle', __filename)
				.expect((resp) => {
					assert.equal(resp.body.error, "Bundle is already uploaded for android platform and app version 1.0.0");
				})
				.expect(400)
				.then(async () => {
					await testBundle.delete();
				});
		});

		it('should return 200 and save bundle locally', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${admin.api_token}`)
				.field('platform', 'android')
				.field('storage', 'file')
				.field('version', '1.0.0')
				.field('is_update_required', false)
				.attach('bundle', __filename)
				.expect(200)
				.expect((resp) => {
					assert.equal(fs.existsSync(`${__dirname}/../../../static/bundles/1.0.0/android.bundle`), true);
				})
				.then(async () => {
					await Bundle.deleteOne({platform: 'android', version: '1.0.0'});
					fs.unlinkSync(`${__dirname}/../../../static/bundles/1.0.0/android.bundle`);
					fs.rmdirSync(`${__dirname}/../../../static/bundles/1.0.0`);
				});
		});

		it('should return 200 and upload bundle to AWS S3', () => {
			return request(fastify.server)
				.post(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${admin.api_token}`)
				.field('platform', 'android')
				.field('storage', 'aws_s3')
				.field('version', '1.0.0')
				.field('is_update_required', false)
				.attach('bundle', __filename)
				.expect(200)
				.then(async () => {
					await Bundle.deleteOne({platform: 'android', version: '1.0.0'});
				});
		});
	});

	describe('GET /bundles', () => {
		it('should return 401 error on invalid auth token', () => {
			return request(fastify.server)
				.get(`${API_PREFIX}/bundles`)
				.set('Authorization', 'Bearer INVALID')
				.expect(401);
		});

		it('should return 200 and bundles', () => {
			return request(fastify.server)
				.get(`${API_PREFIX}/bundles`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200);
		});
	});

	describe('PATCH /bundles/:id', () => {
		
		let bundleV1 = null;
		let bundleV2 = null;
		
		before(async () => {
			bundleV1 = new Bundle({
				platform: 'android',
				version: '1.0.0',
				is_update_required: false,
				url: 'ANY',
				storage: 'file'
			});
			await bundleV1.save();
			bundleV2 = new Bundle({
				platform: 'android',
				version: '2.0.0',
				is_update_required: false,
				url: 'ANY',
				storage: 'file'
			});
			await bundleV2.save();
		});

		after(async () => {
			await bundleV1.delete();
			await bundleV2.delete();
		});

		it('should return 401 error on invalid auth token', () => {
			return request(fastify.server)
				.patch(`${API_PREFIX}/bundles/1`)
				.set('Authorization', 'Bearer INVALID')
				.expect(401);
		});

		it('should return 400 error if bundle was not found', () => {
			return request(fastify.server)
				.patch(`${API_PREFIX}/bundles/111111111111111111111111`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect((resp) => {
					assert.equal(resp.body.message, 'Bundle not found');
				})
				.expect(400);
		});

		it('should return 400 error if is_update_required field was not set', () => {
			return request(fastify.server)
				.patch(`${API_PREFIX}/bundles/${bundleV1.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({apply_from_version: '1.0.0'})
				.expect((resp) => {
					assert.equal(resp.body.message, "body should have required property 'is_update_required'");
				})
				.expect(400);
		});

		it('should return 400 error if is_update_required field is invalid', () => {
			return request(fastify.server)
				.patch(`${API_PREFIX}/bundles/${bundleV1.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					is_update_required: 'INVALID',
					apply_from_version: '1.0.0'
				})
				.expect((resp) => {
					assert.equal(resp.body.message, "body.is_update_required should be boolean");
				})
				.expect(400);
		});

		it('should return 400 error if apply_from_version field was not set', () => {
			return request(fastify.server)
				.patch(`${API_PREFIX}/bundles/${bundleV1.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({is_update_required: true})
				.expect((resp) => {
					assert.equal(resp.body.message, "body should have required property 'apply_from_version'");
				})
				.expect(400);
		});

		it('should return 400 error if apply_from_version field is invalid', () => {
			return request(fastify.server)
				.patch(`${API_PREFIX}/bundles/${bundleV1.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					is_update_required: true,
					apply_from_version: 'INVALID'
				})
				.expect((resp) => {
					assert.equal(resp.body.message, "body.apply_from_version should match pattern \"^(\\d+\\.)?(\\d+\\.)?(\\*|\\d+)$\"");
				})
				.expect(400);
		});

		it('should return 400 error if apply_from_version is not less than existing bundle version', () => {
			return request(fastify.server)
				.patch(`${API_PREFIX}/bundles/${bundleV1.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					is_update_required: true,
					apply_from_version: '1.0.0'
				})
				.expect((resp) => {
					assert.equal(resp.body.error, "Apply from version 1.0.0 should be less than existing bundle version 1.0.0");
				})
				.expect(400);
		});

		it('should return 200 and disable is_update_required field from all other platform bundles', async () => {
			// enable is_update_required for version 1.0.0
			bundleV1.is_update_required = true;
			await bundleV1.save();
			// set is_update_required to true for version 2.0.0
			return request(fastify.server)
				.patch(`${API_PREFIX}/bundles/${bundleV2.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					is_update_required: true,
					apply_from_version: '1.0.0'
				})
				.expect((resp) => {
					assert.equal(resp.body.is_update_required, true);
				})
				.expect(200)
				.then(async () => {
					const otherBundle = await Bundle.findOne({platform: 'android', version: '1.0.0'});
					assert.equal(otherBundle.is_update_required, false);
				});
		});

		it('should return 200 and update bundle', async () => {
			return request(fastify.server)
				.patch(`${API_PREFIX}/bundles/${bundleV2.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					is_update_required: true,
					apply_from_version: '1.0.0', 
					desc: 'ANY_DESC'
				})
				.expect((resp) => {
					assert.equal(resp.body.is_update_required, true);
					assert.equal(resp.body.apply_from_version, '1.0.0');
					assert.equal(resp.body.desc, 'ANY_DESC');
				})
				.expect(200);
		});
	});

	describe('DELETE /bundles/:id', () => {
		it('should return 401 error on invalid auth token', () => {
			return request(fastify.server)
				.delete(`${API_PREFIX}/bundles/1`)
				.set('Authorization', 'Bearer INVALID')
				.expect(401);
		});

		it('should return 400 error if bundle was not found', () => {
			return request(fastify.server)
				.delete(`${API_PREFIX}/bundles/111111111111111111111111`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect((resp) => {
					assert.equal(resp.body.message, 'Bundle not found');
				})
				.expect(400);
		});

		it('should return 200 and delete locally saved bundle', async () => {
			// create bundle model
			const bundle = new Bundle({
				platform: 'android',
				version: '1.0.0',
				is_update_required: false,
				url: 'ANY',
				storage: 'file'
			});
			await bundle.save();
			// copy bundle file to target folder
			fs.mkdirSync(`${__dirname}/../../../static/bundles/1.0.0`);
			fs.copyFileSync(__filename, `${__dirname}/../../../static/bundles/1.0.0/android.bundle`);
			// delete bundle 
			return request(fastify.server)
				.delete(`${API_PREFIX}/bundles/${bundle.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200)
				.then(async () => {
					const deletedBundle = await Bundle.findOne({platform: 'android', version: '1.0.0'});
					assert.equal(deletedBundle, null);
				});
		});

		it('should return 200 and delete file from AWS S3', async () => {
			// create bundle model
			const bundle = new Bundle({
				platform: 'android',
				version: '1.0.0',
				is_update_required: false,
				url: 'ANY',
				storage: 'aws_s3'
			});
			await bundle.save();
			// delete bundle 
			return request(fastify.server)
				.delete(`${API_PREFIX}/bundles/${bundle.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200)
				.then(async () => {
					const deletedBundle = await Bundle.findOne({platform: 'android', version: '1.0.0'});
					assert.equal(deletedBundle, null);
				});
		});
	});
});
