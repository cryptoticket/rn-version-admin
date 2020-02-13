/**
 * Bundles API
 */

async function routes(fastify, options) {

	const Bundle = fastify.mongo.model('Bundle');

	/**
	 * Create a new bundle
	 */
	fastify.post('/bundles', {
		schema: {
			body: {
				type: 'object',
				required: ['platform', 'storage', 'version', 'is_update_required'],
				properties: {
					platform: {
						type: 'string',
						enum: ['android', 'ios']
					},
					storage: {
						type: 'string',
						enum: ['file', 'aws_s3']
					},
					version: {
						type: 'string',
						pattern: '^(\\d+\\.)?(\\d+\\.)?(\\*|\\d+)$'
					},
					is_update_required: {
						type: 'boolean'
					}
				}
			},
			response: {
				200: {
					type: 'object',
					properties: {
						_id: { type: 'string' },
						platform: { type: 'string' },
						storage: { type: 'string' },
						version: { type: 'string' },
						is_update_required: { type: 'boolean' },
						url: { type: 'string' },
						created_at: { type: 'string' },
						updated_at: { type: 'string' }
					}
				}
			}
		}
	}, async function (request, reply) {
		// TODO: auth by api token
		// TODO: upload local or s3
		const bundle = new Bundle(request.body);
		bundle.url = 'https://aws.com/android.bundle';
		await bundle.save();
		reply.send(bundle);
	});

}

module.exports = routes;
