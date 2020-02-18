import axios from 'axios';

// if user auth token exists then assign it to auth header
const userAuthToken = localStorage.getItem('token');
if(userAuthToken) axios.defaults.headers.common['Authorization'] = `Bearer ${userAuthToken}`;

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
	// users API
	getUsers
};
