const https = require('https');
const axios = require('axios');
const config = require('./conf/conf');

const clientUrl = config.client.url;

exports.login = function(user, pass) {
	return axios.post(`${clientUrl}/auth/signin`, {
		username: user,
		password: pass
	})
	.then((data) => data)
	.catch((err) => console.log('ERROR: ' + err));
};

exports.verify = function(token) {
	const _token = token;
	return axios.post(`${clientUrl}/auth/checktoken`, {
		access_token: _token
	})
	.then((data) => data)
	.catch((err) => console.log('ERROR: ' + err));
};


exports.getCal = function(config) {
	const calName = config.name;
	const calKey = config.key;
	const currDate = new Date().toISOString();

	if(!calName || !calKey) {
		next(new Error('Calendar name / key not provided'));
	}
	else {
		const calUrl = `https://www.googleapis.com/calendar/v3/calendars/${calName}/events?key=${calKey}&timeMin=${currDate}&maxResults=8&singleEvents=true&orderBy=startTime`;
		return axios.get(calUrl)
			.then((res) => res)
			.catch((err) => console.log('ERROR: ' + err));
	}
};

exports.getGallery = function(dirname) {
	const _dirname = dirname;
	if(!dirname) {
		next(new Error('No directory name provided'));
	} else {
		return axios.get(`${clientUrl}/api/gallery`);
	}
}