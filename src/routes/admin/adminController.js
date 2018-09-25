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


exports.exportUsers = function(req, res, next) {
	const token =req.signedCookies['necc_token'];
	if(!token) {
		res.render('error', {
			title: 'Token missing!',
			messge: 'Your admin token is missing. Try logging in again and make sure cookies are enabled.'
		});
	} else {
		clientApi.getAllUsers(token)
			.then((users) => {
				let userArray = [];
				userArray.push('FIRST_NAME, LAST_NAME, EMAIL, USER_ID, PURCHASE_ID, PURCHASE_DATE');
				users.map((user) => {
					userArray.push(`${user.fname},${user.lname},${user.email},${user._id},${user.purchase_id},${user.signdate}`);
				});
				let dataString = userArray.join('\n');
				res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
				res.setHeader('Content-Type', 'text/csv');
				res.status(200).send(dataString);
			})
			.catch(err => next(err));

	}

};


