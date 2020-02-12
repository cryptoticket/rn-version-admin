/**
 * Users API
 */

async function routes(fastify, options) {

	const User = fastify.mongo.model('User');

	/**
	 * Create a new user
	 */
	fastify.post('/users', {
		schema: {
			body: {
				type: 'object',
				required: ['email'],
				properties: {
					email: {
						type: 'string',
						format: 'email'
					}
				}
			},
			response: {
				200: {
					type: 'object',
					properties: {
						_id: { type: 'string' },
						email: { type: 'string' },
						api_token: { type: 'string' },
						created_at: { type: 'string' },
						updated_at: { type: 'string' }
					}
				}
			}
		},
		preValidation: async (request, reply) => {
			// check that email is not used
			const count = await User.count({email: request.body.email});
			if(count > 0) {
				reply.code(400);
				throw new Error('Email is already used');
			}
		}
	}, async function (request, reply) {
		const user = new User(request.body);
		await user.save();
		reply.send(user);
	});

	/**
	 * Get users
	 */
	fastify.get('/users', {
		schema: {
			response: {
				200: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							_id: { type: 'string' },
							email: { type: 'string' },
							api_token: { type: 'string' },
							created_at: { type: 'string' },
							updated_at: { type: 'string' }
						}
					}
				}
			}
		},
	}, async function (request, reply) {
		const users = await User.find();
		reply.send(users);
	});

	/**
	 * Update user
	 */
	fastify.patch('/users/:id', {
		schema: {
			body: {
				type: 'object',
				required: ['email'],
				properties: {
					email: {
						type: 'string',
						format: 'email'
					}
				}
			},
			params: {
				type: 'object',
				required: ['id'],
				properties: {
					id: {
						type: 'string',
						pattern: '^[0-9a-fA-F]{24}$'
					}
				}
			},
			response: {
				200: {
					type: 'object',
					properties: {
						_id: { type: 'string' },
						email: { type: 'string' },
						api_token: { type: 'string' },
						created_at: { type: 'string' },
						updated_at: { type: 'string' }
					}
				}
			}
		},
		preValidation: async (request, reply) => {
			// check that user exists
			const user = await User.findById(request.params.id);
			if(!user) {
				reply.code(400);
				throw new Error('User not found');
			}
			// check that email is not used
			const users = await User.find({email: request.body.email});
			// if user with email found
			if(users.length === 1) {
				// if it is not the currently updated user then throw error
				if(users[0].id !== request.params.id) {
					reply.code(400);
					throw new Error('Email is already used');
				}
			}
		}
	}, async function (request, reply) {
		const user = await User.findOneAndUpdate({_id: request.params.id}, request.body, {new: true});
		reply.send(user);
	});

	/**
	 * Delete user
	 */
	fastify.delete('/users/:id', {
		schema: {
			params: {
				type: 'object',
				required: ['id'],
				properties: {
					id: {
						type: 'string',
						pattern: '^[0-9a-fA-F]{24}$'
					}
				}
			},
			response: {
				200: {
					type: 'object'
				}
			}
		},
		preValidation: async (request, reply) => {
			// check that user exists
			const user = await User.findById(request.params.id);
			if(!user) {
				reply.code(400);
				throw new Error('User not found');
			}
		}
	}, async function (request, reply) {
		await User.deleteOne({_id: request.params.id});
		reply.send();
	});

}

module.exports = routes;
