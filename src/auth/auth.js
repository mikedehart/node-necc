const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const config = require('../conf/conf');
const checkToken = expressJwt({ secret: config.secrets.jwt });
const Admin = require('../api/admin/adminModel');


// Decode incoming token. Returns a middleware function
exports.decodeToken = function() {
	return function(req, res, next) {
		// Check for token in query string
		if(req.query && req.query.hasOwnProperty('access_token')) {
			req.headers.authorization = 'Bearer ' + req.query.access_token;
		}

		// Will call next if token is valid, and send error if it is not.
		// Decoded token attached to req.user
		checkToken(req, res, next);
	};
};

// Make sure incoming decoded token points to a real user in the database
// Called AFTER decodeToken()
exports.verifyToken = function() {
	return function(req, res, next) {
		if(!req.user) {
			//res.status(401).send('No user info!');
			next(new Error('No user information'));
		} else {
			let userId = req.user._id;
			Admin.findById(userId)
				.then((user) => {
					if(!user) {
						//res.status(401).send('No valid user for your token');
						next(new Error('No valid user for this token'));
					} else {
						req.user = user;
						next();
					}
				}, (err) => {
					next(err);
				});

		}
	};
};

// After token decoded, still want to check it against database
// to make sure it is a valid value
exports.verifyUser = function() {
	return function(req, res, next) {
		const username = req.body.username;
		const password = req.body.password;

		// If no username / password then stop
		if(!username || !password) {
			//res.status(401).send('No username / password sent!');
			next(new Error('No username / password given'));
			return;
		}

		Admin.findOne({ username: username })
			.then((user) => {
				if(!user) {
					//res.status(401).send('No user with given username');
					next(new Error('No user with given Username!'));
				} else {
					if(!user.authenticate(password)) {
						next(new Error('Incorrect password'));
						//res.status(401).send("Incorrect password");
					} else {
						// Checks out, assign the user to req.user
						req.user = user;
						next();
					}
				}
			},
			(err) => {
				next(err);
			});
	};
};


// Sign token after successful login
exports.signToken = function(id) {
	return jwt.sign(
		{ _id: id },
		config.secrets.jwt,
		{ expiresIn: config.secrets.expireTime }
	);
};