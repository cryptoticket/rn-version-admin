/**
 * Bundles API
 */

const fs = require('fs');
const pump = require('pump');
const Readable = require('stream').Readable;

async function routes(fastify, options) {

	const Bundle = fastify.mongo.model('Bundle');
	const User = fastify.mongo.model('User');

	/**
	 * Create a new bundle
	 */
	fastify.post('/bundles', {
		schema: {
			body: {
				type: 'object',
				required: ['platform', 'storage', 'version', 'is_update_required', 'bundle'],
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
					},
					bundle: { 
						type: 'array', 
						items: 'MultipartFileType#' 
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
						desc: { type: 'string' },
						created_at: { type: 'string' },
						updated_at: { type: 'string' }
					}
				}
			}
		},
		preValidation: async (request, reply) => {
			// check that auth header exists
			if(!request.headers['authorization']) {
				reply.code(403).send(new Error('Autorization header is not set'));
				return;
			}
			// check that user with auth api token exists
			const mUser = await User.findOne({api_token: request.headers['authorization'].replace('Bearer ', '')});
			if(!mUser) {
				reply.code(403).send(new Error('Invalid api token'));
				return;
			}
			// check that request is multipart/form-data
			if (!request.isMultipart()) {
				reply.code(400).send(new Error('Request is not multipart'));
				return;
			}
		}
	}, async function (request, reply) {
		// TODO: check that bundles are available via local and s3 storage

		// validate that bundle for this platform and version does not exist
		const oldBundle = await Bundle.findOne({platform: request.body.platform, version: request.body.version});
		if(oldBundle) {
			reply.code(400).send({error: `Bundle is already uploaded for ${request.body.platform} platform and app version ${request.body.version}`});
			return;
		}

		// create a new bundle
		const bundle = new Bundle(request.body);

		// if we want to store bundle file on our own server
		if(request.body.storage === 'file') {
			const localPath = `${__dirname}/../../static/bundles/${request.body.version}`;
			// if folder does not exist then create it
			if(!fs.existsSync(localPath)) fs.mkdirSync(localPath);
			// convert file buffer to readable stream
			const readable = new Readable();
			readable._read = () => {};
			readable.push(request.body.bundle[0].data);
			readable.push(null);
			// save file to folder
			pump(readable, fs.createWriteStream(`${localPath}/${request.body.platform}.bundle`));
			// assign url to bundle
			bundle['url'] = `${process.env.API_URL}/static/bundles/${request.body.version}/${request.body.platform}.bundle`;
		}

		// if we want to store bundle on AWS S3
		if(request.body.storage === 'aws_s3') {
			// upload file to AWS S3
			const uploadParams = {
				Bucket: process.env.AWS_S3_BUCKET, 
				Key: `bundles/${request.body.version}/${request.body.platform}.bundle`, 
				Body: request.body.bundle[0].data
			};
			const resp = await fastify.aws_s3.upload(uploadParams).promise();
			// assign url to bundle
			bundle['url'] = resp['Location'];
		}
		
		// save bundle
		await bundle.save();

		// send the newly created bundle
		reply.code(200).send(bundle);
	});

	/**
	 * Get bundles
	 */
	fastify.get('/bundles', {
		schema: {
			querystring: {
				type: 'object',
				properties: {
					page: {
						type: 'number',
						default: 0
					}
				}
			},
			response: {
				200: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							_id: { type: 'string' },
							desc: { type: 'string' },
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
		},
		preValidation: [
			fastify.authenticate
		],
		onSend: async (request, reply, payload) => {
			const totalCount = await Bundle.countDocuments();
			const pageLast = totalCount % +process.env.ITEMS_PER_PAGE === 0 ? Math.floor(totalCount / +process.env.ITEMS_PER_PAGE) - 1 : Math.floor(totalCount / +process.env.ITEMS_PER_PAGE);
			reply.header('X-Total-Count', totalCount);
			reply.header('X-Limit', process.env.ITEMS_PER_PAGE);
			reply.header('X-Page', request.query.page);
			reply.header('X-Page-Last', pageLast);
		}
	}, async function (request, reply) {
		const bundles = await Bundle.find().skip(+process.env.ITEMS_PER_PAGE * request.query.page).limit(+process.env.ITEMS_PER_PAGE);
		reply.send(bundles);
	});

	/**
	 * Update bundle
	 */
	fastify.patch('/bundles/:id', {
		schema: {
			body: {
				type: 'object',
				required: ['is_update_required'],
				properties: {
					is_update_required: {
						type: 'boolean'
					},
					desc: {
						type: 'string'
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
						desc: { type: 'string' },
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
		},
		preValidation: [
			fastify.authenticate,
			async (request, reply) => {
				// check that bundle exists
				const bundle = await Bundle.findById(request.params.id);
				if(!bundle) {
					reply.code(400);
					throw new Error('Bundle not found');
				}
			}
		], 
	}, async function (request, reply) {
		const bundle = await Bundle.findById(request.params.id);
		// if we are enabling "is_update_required" then disable any other required updates for the platform
		if(request.body.is_update_required) {
			await Bundle.updateMany({platform: bundle.platform}, {is_update_required: false});
		}
		// update bundle
		bundle.is_update_required = request.body.is_update_required;
		bundle.desc = request.body.desc;
		await bundle.save();
		reply.send(bundle);
	});

}

module.exports = routes;
