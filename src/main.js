const express = require('express');
const bp = require('body-parser');

const app = express();


// use pug template engine
app.set('view engine', 'pug');

// Middleware
app.use(bp.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));


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
	res.render('gallery');
})



module.exports = app;