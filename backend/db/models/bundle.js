const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const bundleSchema = new Schema({
	platform: {
		type: String,
		enum: ['android', 'ios'],
		required: true
	},
	storage: {
		type: String,
		enum: ['file', 'aws_s3'],
		required: true
	},
	version: {
		type: String,
		validate: {
			validator: function(value) {
			  	return /^(\d+\.)?(\d+\.)?(\*|\d+)$/.test(value);
			},
			message: props => `${props.value} is not in a semver format`
		},
		required: true
	},
	is_update_required: {
		type: Boolean,
		required: true
	},
	url: {
		type: String,
		required: true,
		validate: [validator.isURL, 'Invalid URL']
	},
	desc: {
		type: String,
		default: null
	}
}, { 
	timestamps: { 
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
});

const Bundle = mongoose.model('Bundle', bundleSchema);

module.exports = Bundle;
