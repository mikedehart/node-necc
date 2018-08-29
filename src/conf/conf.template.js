/*
	Config file for the server.
	Variables default to development unless set at the OS level.
	Variables:
		NODE_ENV: ('production' | 'development')
		NODE_PORT: port to run on
		NODE_LOGGING: allow logging (true | false)
		NODE_DB: server address for mongodb
		NODE_DB_OPTIONS: mongodb options to set
*/

var config = {
	env: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 'DEFAULT_PORT',
	db: {
		url: process.env.NODE_DB || '<DEFAULT_MONGO_URL',
		options: {
			useMongoClient: true
		}
	},
	logging: process.env.NODE_LOGGING || true
};

module.exports = config;