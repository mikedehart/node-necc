const clientApi = require('../../api');

exports.get = function(req, res, next) {
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
};

exports.post = function(req, res, next) {
	const username = req.body.username;
	const password = req.body.password;
	if(!username || !password) {
		res.render('error', { title: 'No username / password given',
								message: 'One of the two was missing. Try again.'})
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
};


