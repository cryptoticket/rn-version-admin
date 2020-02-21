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
	// users API
	getUsers
};
