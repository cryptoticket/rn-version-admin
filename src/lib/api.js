import axios from 'axios';

// if user auth token exists then assign it to auth header
const userAuthToken = localStorage.getItem('token');
if(userAuthToken) axios.defaults.headers.common['Authorization'] = `Bearer ${userAuthToken}`;

/**
 * Bundles API
 */

/**
 * Return bundles by page number 
 */
async function getBundles(page = 0) {
	return await axios.get('/api/v1/bundles', { params: {
		page: page
	}});
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
 * Return users by page number 
 */
async function getUsers(page = 0) {
	return await axios.get('/api/v1/users', { params: {
		page: page
	}});
}

export default {
	// bundles API
	getBundles,
	updateBundle,
	// users API
	getUsers
};
