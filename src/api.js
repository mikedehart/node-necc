const axios = require('axios');
const config = require('./conf/conf');
const qs = require('qs');

const apiUrl = config.api.url;


/* AUTHORIZATION FUNCTIONS 
----------------------------*/


/* ADMIN */
exports.login = function(user, pass) {
	return axios.post(`${apiUrl}/auth/signin`, {
		username: user,
		password: pass
	})
	.then((data) => data)
	.catch((err) => console.error('ERROR: ' + err));
};

exports.verify = function(token) {
	const _token = token;
	return axios.post(`${apiUrl}/auth/checktoken`, {
		access_token: _token
	})
	.then((data) => data.data)
	.catch((err) => console.error('ERROR: ' + err));
};


/* USER */
exports.authUser = function(email, key) {
	return axios.post(`${apiUrl}/api/user/lookup`, {
		email: email,
		sitekey: key
	})
		.then((user) => {
			if(!user) {
				return undefined;
			} else {
				return user.data;
			}
		})
		.catch((err) => console.error(err));
}


/* FUNCTIONS FOR CALENDAR / GALLERIES 
-------------------------------------------*/

exports.getCal = function() {
	const calName = config.client.calendar.name;
	const calKey = config.client.calendar.key;
	const currDate = new Date().toISOString();

	if(!calName || !calKey) {
		next(new Error('Calendar name / key not provided'));
	}
	else {
		const calUrl = `https://www.googleapis.com/calendar/v3/calendars/${calName}/events?key=${calKey}&timeMin=${currDate}&maxResults=8&singleEvents=true&orderBy=startTime`;
		return axios.get(calUrl)
			.then((res) => res)
			.catch((err) => console.error('ERROR: ' + err));
	}
};

exports.getGalleries = function() {
		return axios.get(`${apiUrl}/api/gallery`)
			.then((galleries) => galleries.data)
			.catch((err) => console.error('ERROR: ' + err));
};

exports.getGallery = function(id) {
	return axios.get(`${apiUrl}/api/gallery/${id}`)
		.then((gallery) => gallery.data)
		.catch((err) => console.error('ERROR: ' + err));
};

exports.addGallery = function(title, path, dirname, evtdate, text, token) {
	return axios.post(`${apiUrl}/api/gallery`, {
		title,
		path,
		dirname,
		evtdate,
		text,
		access_token: token
	})
		.then((gallery) => gallery.data)
		.catch(err => console.error(err));
};

/* USER CREATE / FETCH FUNCTIONS
----------------------------------- */


exports.createUser = function(id, fname, lname, email, sub) {
	return axios.post(`${apiUrl}/api/user`, {
		purchase_id: id,
		fname,
		lname,
		email,
		subscribed: sub,
	})
	.then((res) => {
		return res.data;
	})
	.catch(err => {
		console.error(err);
		return err;
	});
};

exports.getUser = function(id) {
	const userId = id;
	return axios.get(`${apiUrl}/api/user/${userId}`)
	.then((user) => user.data)
	.catch(err => console.error(err));
}


/* PAYPAL FUNCTIONS 
----------------------*/

exports.getToken = function(client_id, secret) {
	const url = `${config.paypal.url}/v1/oauth2/token`;
	const data = {
		grant_type: 'client_credentials'
	};
	const auth = {
		username: config.paypal.client_id,
		password: config.paypal.secret
	};
	const options = {
		method: 'post',
		headers: {
			'content-type': 'application/x-www-form-urlencoded'
		},
		withCredentials: true,
		data: qs.stringify(data),
		auth: auth,
		url: url
	};


	return axios(options)
		.then((res) => res.data)
		.catch(err => console.error(err));
};