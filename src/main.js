
const express = require('express');

// 3rd Party Middleware / Libraries
const bp = require('body-parser');
const morgan = require('morgan');
const cp = require('cookie-parser');
const qs = require('qs');

// Local requires
const config = require('./conf/conf');
const clientApi = require('./api');
const calendar = require('./public/scripts/fetchevents');
const util = require('./public/scripts/util');

// Routes
const api = require('./api/api');
const auth = require('./auth/authRoutes');
const admin = require('./routes/admin/adminRoutes');
const members = require('./routes/member/memberRoutes');
const galleries = require('./routes/gallery/galleryRoutes');

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
app.use('/api', api); // API endpoint routes
app.use('/auth', auth); // Authorization routes
app.use('/admin', admin); // Admin login / console routes
app.use('/members', members); // Member login / console routes
app.use('/gallery', galleries); // Gallery routes


app.get('/', (req, res, next) => {
	res.render('index', { title: 'Home' });
})

app.get('/events', (req, res, next) => {
	clientApi.getCal()
		.then((response) => {
			let calItems = calendar.processEvents(response);
			let locUrl = config.client.location.url;
			let calUrl = config.client.calendar.url;
			res.render('events', { 
				dates: calItems, 
				mapsUrl: locUrl,
				calUrl: calUrl,
				title: 'Events' });
		})
		.catch((err) => next(new Error(err.toString())));
})

app.get('/service', (req, res, next) => {
	res.render('service', { title: 'Service' });
})

app.get('/membership', (req, res, next) => {
	res.render('membership', { title: 'Membership' });
})


// ------- Final Error Handling -------

app.use((err, req, res, next) => {
	// If error thrown from JWT validation
	if(err.name === 'UnauthorizedError') {
		//res.status(401).send('No authorization token found!');
		res.render('error', { title: 'Invalid Token!', message: err.stack });
		return;
	}
	res.render('error', { title: err, message: err.stack });
});

module.exports = app;