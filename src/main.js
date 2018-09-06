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
//app.use(morgan('dev'));
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
app.use(cp(config.client.cookie));
app.use(express.static(__dirname + '/public'));

// Setup additional routes
app.use('/api', api);
app.use('/auth', auth);


app.get('/', (req, res, next) => {
	res.render('index');
})

app.get('/events', (req, res, next) => {
	clientApi.getCal(config.client.calendar)
		.then((response) => {
			console.log(response);
			let calItems = calendar.processEvents(response);
			res.render('events', { 'dates': calItems });
		})
		.catch((err) => next(new Error(err.toString())));

	//res.render('events');
})

app.get('/service', (req, res, next) => {
	res.render('service');
})

app.get('/membership', (req, res, next) => {
	res.render('membership');
})

const fs = require('fs');

app.get('/gallery', (req, res, next) => {
	res.render('gallery');
})

app.get('/gallery/:id', (req, res, next) => {
	if(!req.params.id) {
		next(new Error('No image gallery provided'));
	} else {
		const fldr = req.params.id;
		const imgPath = `/img/events/${fldr}/`;
		const osFldr = (__dirname + `/public/${imgPath}`);
		let imgs = [];

		fs.readdir(osFldr, (err, files) => {
			if(err) {
				next(new Error('Invalid image path!'));
				return;
			} else {
				files.forEach((file) => {
					console.log(file);
					imgs.push(file);
				});
				res.render('gallery', {
					path: imgPath,
					imgs: imgs
				});
			}
		});
	}
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
				} else {
					res.render('admin/console');
				}
			})
			.catch(err => next(err));
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
	if(!username || !password) {
		res.render('error', { title: 'No username / password given',
								message: 'One of the two was missing. Try again.'})
		return;
	} else {
		clientApi.login(username, password)
			.then(token => {
				if(!token) {
					res.render('error', {title: 'Incorrect username / password',
						message: 'Try again'});
				} else {
					res.cookie('necc_token', token.data, { signed: true });
					res.redirect('/admin');
				}
			})
			.catch((err) => next(err));
	}
})


// Final error handling function
app.use((err, req, res, next) => {
	// If error thrown from JWT validation
	if(err.name === 'UnauthorizedError') {
		res.status(401).send('No authorization token found!');
		//res.render('error', { title: 'Invalid Token!', message: err.stack });
		return;
	}
	res.render('error', { title: err, message: err.stack });
});



module.exports = app;