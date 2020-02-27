const assert = require('assert');
const request = require('supertest');

let fastify = require('../../../server/server');

const ADMIN_EMAIL = 'admin@mail.com';
const API_PREFIX = '/api/v1';

describe('users API tests', () => {

	// user db model
	let User = null;

	let admin = null;
	let adminToken = null;

	before(async () => {
		// wait for fastify to be initialized
		await fastify.ready();
		// create a temp admin
		User = fastify.mongo.model('User');
		admin = new User({email: ADMIN_EMAIL});
		await admin.save();
		// get admin access token
		adminToken = fastify.jwt.sign({id: admin.id, email: ADMIN_EMAIL});
	});

	after(async () => {
		await fastify.close();
		await admin.delete();
	});

	describe('POST /users', () => {
		it('should return 401 error on invalid auth token', (done) => {
			request(fastify.server)
				.post(`${API_PREFIX}/users`)
				.set('Authorization', 'Bearer INVALID')
				.expect(401, done);
		});

		it('should return 400 if email is already used', (done) => {
			request(fastify.server)
				.post(`${API_PREFIX}/users`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({email: ADMIN_EMAIL})
				.expect((resp) => {
					assert.equal(resp.body.message, 'Email is already used');
				})
				.expect(400, done);
		});

		it('should return 400 if email is not sent', (done) => {
			request(fastify.server)
				.post(`${API_PREFIX}/users`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({})
				.expect((resp) => {
					assert.equal(resp.body.message, 'body should have required property \'email\'');
				})
				.expect(400, done);
		});

		it('should return 400 if email is invalid', (done) => {
			request(fastify.server)
				.post(`${API_PREFIX}/users`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({email: 'INVALID'})
				.expect((resp) => {
					assert.equal(resp.body.message, 'body.email should match format "email"');
				})
				.expect(400, done);
		});

		it('should return 200 if user was created', (done) => {
			request(fastify.server)
				.post(`${API_PREFIX}/users`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({email: 'test_user@mail.com'})
				.expect(200)
				.end((err, res) => {
					if (err) throw err;
					User.deleteOne({email: 'test_user@mail.com'}, done);
				});
		});
	});

	describe('GET /users', () => {
		it('should return 401 error on invalid auth token', (done) => {
			request(fastify.server)
				.get(`${API_PREFIX}/users`)
				.set('Authorization', 'Bearer INVALID')
				.expect(401, done);
		});

		it('should return 200 and users', (done) => {
			request(fastify.server)
				.get(`${API_PREFIX}/users`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200, done);
		});
	});

	describe('PATCH /users/:id', () => {

		let testUser = null;

		before(async () => {
			testUser = new User({email: 'test_user@mail.com'});
			await testUser.save();
		});

		after(async () => {
			await testUser.delete();
		});

		it('should return 401 error on invalid auth token', (done) => {
			request(fastify.server)
				.patch(`${API_PREFIX}/users/${testUser.id}`)
				.set('Authorization', 'Bearer INVALID')
				.expect(401, done);
		});

		it('should return 400 if user was not found', (done) => {
			request(fastify.server)
				.patch(`${API_PREFIX}/users/111111111111111111111111`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect((resp) => {
					assert.equal(resp.body.message, 'User not found');
				})
				.expect(400, done);
		});

		it('should return 400 if user is trying to set email that already exists', (done) => {
			request(fastify.server)
				.patch(`${API_PREFIX}/users/${testUser.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({email: ADMIN_EMAIL})
				.expect((resp) => {
					assert.equal(resp.body.message, 'Email is already used');
				})
				.expect(400, done);
		});

		it('should return 400 if email is empty', (done) => {
			request(fastify.server)
				.patch(`${API_PREFIX}/users/${testUser.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({})
				.expect((resp) => {
					assert.equal(resp.body.message, "body should have required property 'email'");
				})
				.expect(400, done);
		});

		it('should return 400 if email is invalid', (done) => {
			request(fastify.server)
				.patch(`${API_PREFIX}/users/${testUser.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({email: 'INVALID'})
				.expect((resp) => {
					assert.equal(resp.body.message, 'body.email should match format "email"');
				})
				.expect(400, done);
		});

		it('should return 200 and update user email', (done) => {
			request(fastify.server)
				.patch(`${API_PREFIX}/users/${testUser.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({email: 'test_user2@mail.com'})
				.expect((resp) => {
					assert.equal(resp.body.email, 'test_user2@mail.com');
				})
				.expect(200, done);
		});
	});

	describe('DELETE /users/:id', () => {
		it('should return 401 error on invalid auth token', (done) => {
			request(fastify.server)
				.delete(`${API_PREFIX}/users/1`)
				.set('Authorization', 'Bearer INVALID')
				.expect(401, done);
		});

		it('should return 400 if user was not found', (done) => {
			request(fastify.server)
				.delete(`${API_PREFIX}/users/111111111111111111111111`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect((resp) => {
					assert.equal(resp.body.message, 'User not found');
				})
				.expect(400, done);
		});

		it('should return 200 and delete user', async () => {
			// create test user
			const testUser = new User({email: 'test_user@mail.com'});
			await testUser.save();
			// delete user
			return request(fastify.server)
				.delete(`${API_PREFIX}/users/${testUser.id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200)
				.expect(async () => {
					const deletedUser = await User.findOne({email: 'test_user@mail.com'});
					assert.equal(deletedUser, null);
				})
		});
	});
});
