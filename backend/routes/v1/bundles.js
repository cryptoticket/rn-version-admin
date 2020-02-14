/**
 * Bundles API
 */

const fs = require('fs');
const pump = require('pump');

async function routes(fastify, options) {

	const Bundle = fastify.mongo.model('Bundle');

	/**
	 * Create a new bundle
	 */
	fastify.post('/bundles', {
		schema: {
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
			// check that request is multipart/form-data
			if (!request.isMultipart()) {
				reply.code(400).send(new Error('Request is not multipart'))
			}
		}
	}, function (request, reply) {
		// TODO: auth by api token
		// TODO: validate that there is not version for this platform
		// TODO: upload local or s3
		// TODO: check that bundles are available via local and s3 storage

		let bundleData = {};
		let isBundleUploaded = false;
		let validationError = null;

		const getValidationError = () => {
			let err = null;
			if(!bundleData['platform']) err = "platform field is required";
			if(bundleData['platform'] && !['android', 'ios'].includes(bundleData['platform'])) err = "Invalid platform. Available values: android, ios";
			if(!bundleData['storage']) err = "storage field is required";
			if(bundleData['storage'] && !['file', 'aws_s3'].includes(bundleData['storage'])) err = "Invalid storage. Available values: file, aws_s3";
			if(!bundleData['version']) err = "version field is required";
			if(bundleData['version'] && !RegExp(/^(\d+\.)?(\d+\.)?(\*|\d+)$/).test(bundleData['version'])) err = 'Invalid semver version format';
			if(!bundleData['is_update_required']) err = 'is_updated_required field is required';
			if(bundleData['is_update_required'] && !['1', '0'].includes(bundleData['is_update_required'])) err = 'Invalid is_updated_required. Available values: 1, 0';
			return err;
		};

		const multipart = request.multipart((field, file, filename, encoding, mimetype) => {
			// validate bundle params
			validationError = getValidationError();
			// if there is no validation error and bundle was sent then save it
			if(!validationError && field === 'bundle') {
				// if storage is local file
				if(bundleData['storage'] === 'file') {
					const localPath = `${__dirname}/../../static/bundles/${bundleData['version']}`;
					// if folder does not exist then create it
					if(!fs.existsSync(localPath)) fs.mkdirSync(localPath);
					// save file to folder
					pump(file, fs.createWriteStream(`${localPath}/${bundleData['platform']}.bundle`));
				}
				// set flag that bundle was uploaded
				isBundleUploaded = true;
			}
			// mandatory drain the file stream
			file.resume();
		}, async (err) => {
			// response handler
			if(err) {
				reply.code(500).send(err);
			} else if(validationError) {
				reply.code(400).send({error: validationError});
			} else if(!isBundleUploaded) {
				reply.code(500).send({error: 'Error uploading bundle'});
			} else {
				// save bundle model and return it
				bundleData['url'] = `${process.env.API_URL}/static/bundles/${bundleData['version']}/${bundleData['platform']}.bundle`;
				const bundle = new Bundle(bundleData);
				await bundle.save();
				reply.code(200).send(bundle);
			}
		});
		
		// assign request body params to bundle object
		multipart.on('field', (key, value) => {
			bundleData[key] = value;
		});
	});

}

module.exports = routes;
