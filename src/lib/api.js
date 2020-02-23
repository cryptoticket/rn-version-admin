import axios from 'axios';

// if user auth token exists then assign it to auth header
const userAuthToken = localStorage.getItem('token');
if(userAuthToken) axios.defaults.headers.common['Authorization'] = `Bearer ${userAuthToken}`;

/**
 * Bundles API
 */

/**
 * Deletes bundle 
 */
async function deleteBundle(id) {
	return await axios.delete(`/api/v1/bundles/${id}`);
};


/**
 * Return bundles by page number 
 */
async function getBundles(page = 0) {
	return await axios.get('/api/v1/bundles', { params: {
		page: page
	}});
}

/**
 * Returns latest bundle by platform (ios or android)
 */
async function getLatestBundle(paltform) {
	return await axios.get(`/api/v1/bundles/latest/${paltform}`);
}

/**
 * Updates bundle 
 */
async function updateBundle(bundle) {
	return await axios.patch(`/api/v1/bundles/${bundle._id}`, bundle);
};

/**
 * Users API
 */

/**
 * Creates a new user 
 */
async function createUser(user) {
	return await axios.post('/api/v1/users', user);
}

/**
 * Deletes user 
 */
async function deleteUser(id) {
	return await axios.delete(`/api/v1/users/${id}`);
};

/**
 * Return users by page number 
 */
async function getUsers(page = 0) {
	return await axios.get('/api/v1/users', { params: {
		page: page
	}});
}

/**
 * Updates user 
 */
async function updateUser(user) {
	return await axios.patch(`/api/v1/users/${user._id}`, user);
};

export default {
	// bundles API
	deleteBundle,
	getBundles,
	getLatestBundle,
	updateBundle,
	// users API
	createUser,
	deleteUser,
	getUsers,
	updateUser
};
