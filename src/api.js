const axios = require('axios');
const config = require('./conf/conf');

const clientURL = config.client.url;

exports.login = function(user, pass) {
	console.log('IN AXIOS: '+ user + pass);
	return axios.post(`${clientURL}/auth/signin`, {
		username: user,
		password: pass
	})
	.then((data) => data)
	.catch((err) => console.error(err));
};

