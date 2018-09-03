const express = require('express');
// 3rd Party Middleware
const bp = require('body-parser');
const morgan = require('morgan');
const cp = require('cookie-parser');
// Local requires
const config = require('./conf/conf');
const clientApi = require('./api');
const calendar = require('./public/scripts/fetchevents');
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
	clientApi.getCal(config.client.calendar)
		.then((res) => {
			let calItems = calendar.processEvents(res);
			res.render('events', { 'dates': calItems });
		})
		.catch((err) => next(new Error('Error fetching events!')));

	res.render('events');
})

app.get('/service', (req, res, next) => {
	res.render('service');
})

app.get('/membership', (req, res, next) => {
	res.render('membership');
})

app.get('/gallery', (req, res, next) => {
	res.render('gallery');
})

// -------------- Admin Routes ---------------

// Check for cookie. 
//   If no cookie, send to login page
//   Else, authorize cookie and make sure ID is correct
app.get('/admin', (req, res, next) => {
	let cookies = req.signedCookies['necc_token'];
	if(cookies) {
		clientApi.verify(cookies)
			.then(isValid => {
				if(!isValid) {
					res.render('error', { title: 'Invalid token!',
								message: 'Your token does not validate. Try deleting cache / cookies and try again.'})
				}
			})
			.catch(err => console.error(err));
		res.render('admin/console');
	} else {
		res.render('admin/login');
	}
});

// 
app.get('/login', (req, res, next) => {
	res.render('admin/login.pug');
});



// Login page submits here
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
					res.redirect('/admin');
				}
			})
			.catch((err) => console.error(err));
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