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

module.exports = app;