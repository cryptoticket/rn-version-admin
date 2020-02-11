/**
 * Users API
 */

async function routes(fastify, options) {

	const User = fastify.mongo.model('User');

	/**
	 * Create a new user
	 */
	fastify.post('/users', async function (request, reply) {
		const user = new User({
			email: 'user@gmail.com'
		});
		await user.save();
		reply.send(user);
	});

	/**
	 * Get users
	 */
	fastify.get('/users', async function (request, reply) {
		const users = await User.find();
		reply.send(users);
	});

	/**
	 * Update user
	 */
	fastify.patch('/users/:id', function (request, reply) {
		reply.send('user updated');
	});

	/**
	 * Delete user
	 */
	fastify.delete('/users/:id', function (request, reply) {
		reply.send('user deleted');
	});

}

module.exports = routes;
