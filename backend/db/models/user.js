const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		validate: [validator.isEmail, 'Invalid email']
	},
	api_token: {
		type: String,
		unique: true,
		required: true,
		minlength: [16, 'API token is too short']
	}
}, { 
	timestamps: { 
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
});

userSchema.pre('validate', function(next) {
	// of model is the new one
	if(this.isNew) {
		// generate API token
		this.api_token = crypto.randomBytes(32).toString('hex');
	}
	next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
