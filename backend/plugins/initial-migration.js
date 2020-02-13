/**
 * Populates DB with initial data:
 * - admin email 
 */

async function initialMigration(fastify, options) {
	// create initial admin if it does not exist
	const User = fastify.mongo.model('User');
	const adminCount = await User.countDocuments({email: process.env.ADMIN_EMAIL});
	if(adminCount === 0) {
		const admin = new User({email: process.env.ADMIN_EMAIL});
		await admin.save();
	}
}

module.exports = initialMigration;
