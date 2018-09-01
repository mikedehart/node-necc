const express = require('express');
// 3rd Party Middleware
const bp = require('body-parser');
const morgan = require('morgan');
const cp = require('cookie-parser');
// Local requires
const config = require('./conf/conf');
const clientApi = require('./api');
// Routes
const api = require('./api/api');
const auth = require('./auth/authRoutes');
// App
const app = express();

// Connect to database
require('mongoose').connect(config.db.url, config.db.options);


// use pug template engine
app.set('view engine', 'pug');

// Middleware
app.use(morgan('dev'));
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
app.use(cp(config.client.cookie));
app.use(express.static(__dirname + '/public'));

// Route-specific middleware
const getToken = function() {
	return function(req, res, next) {

	};
};

// Setup additional routes
app.use('/api', api);
app.use('/auth', auth);


app.get('/', (req, res, next) => {
	res.render('index');
})

app.get('/events', (req, res, next) => {
	res.render('events');
})

app.get('/academics', (req, res, next) => {
	res.render('events');
})

app.get('/membership', (req, res, next) => {
	res.render('events');
})

app.get('/gallery', (req, res, next) => {
	console.log(req.body);
	if(req.body.token) {
		console.log('token found!');
		const token = req.body.token;
		res.render('gallery', { token });
	} else {
		res.render('gallery');
	}
})

app.get('/login', (req, res, next) => {


	console.log('Cookies: ', req.cookies);
	console.log('SignedCookies: ', req.signedCookies)
	console.log(req.secret);
	res.cookie('test', 'hello', {signed: true});


	res.render('admin/login.pug');
})

app.post('/authorize', (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;
	console.log(`USER: ${username} | PASS: ${password}`);
	if(!username || !password) {
		res.render('error', { title: 'No username / password given',
								message: 'One of the two was missing. Try again.'})
	} else {
		clientApi.login(username, password)
			.then(token => {
				console.log(token)
				console.log(token.data);
				if(!token) {
					res.render('error', {title: 'Problem with token',
						message: 'Your token sucks'});
				} else {
					res.cookie('necc_token', token.data, { signed: true });
					res.render('admin/console');
				}
			})
	}
})


// Final error handling function
app.use((err, req, res, next) => {
	// If error thrown from JWT validation
	if(err.name === 'UnauthorizedError') {
		res.render('error', { title: 'Invalid Token!', message: err.stack });
		return;
	}
	res.render('error', { title: err.name, message: err.stack });
});



module.exports = app;