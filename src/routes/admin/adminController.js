const clientApi = require('../../api');

/*

	Main route. Pull up console if JWT is valid.
	Otherwise, display login page

------------------------------- */

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

/*

	Verify credentials once user logs in. The redirect back to get route (above)

------------------------------- */

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


/*

	Export users route. Returns csv list of users in the db

------------------------------- */

exports.exportUsers = function(req, res, next) {
	const token = req.signedCookies['necc_token'];
	if(!token) {
		res.render('error', {
			title: 'Token missing!',
			messge: 'Your admin token is missing. Try logging in again and make sure cookies are enabled.'
		});
	} else {
		clientApi.getAllUsers(token)
			.then((users) => {
				let userArray = [];
				userArray.push('FIRST_NAME, LAST_NAME, EMAIL, USER_ID, PURCHASE_ID, SUBSCRIBED, PURCHASE_DATE');
				users.map((user) => {
					userArray.push(`${user.fname},${user.lname},${user.email},${user._id},${user.purchase_id},${user.subscribed},${user.signdate}`);
				});
				let dataString = userArray.join('\n');
				res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
				res.setHeader('Content-Type', 'text/csv');
				res.status(200).send(dataString);
			})
			.catch(err => next(err));

	}

};

/*

	Search users route. To re-generate a token for user, 
	this route is used to look up the user

------------------------------- */

exports.searchUsers = function(req, res, next) {
	const token = req.signedCookies['necc_token'];
	const email = req.body.email;
	if(!token) {
		res.render('error', {
			title: 'Token missing!',
			messge: 'Your admin token is missing. Try logging in again and make sure cookies are enabled.'
		});
	} else {
		if(!email) {
			res.render('error', {
			title: 'No user email given',
			messge: 'User email is missing. Please go back and try again.'
		});
		} else {
			clientApi.getAllUsers(token)
				.then((users) => {
					let userArray = users.filter((user) => {
						if(user.email === email) return user;
					});
					res.render('admin/genkey', {
						users: userArray
					});
				})
				.catch(err => next(err));
		}
	}
};

exports.genKey = function(req, res, next) {
	const userId = req.body.userid;
	const token = req.signedCookies['necc_token'];
	if(!userId || !token) {
		res.render('error', {
			title: 'Token or ID missing!',
			messge: 'Either your JWT token or the Users ID did not come through!'
		});
	} else {
		clientApi.genKey(userId, token)
			.then((user) => {
				res.render('admin/genkey', {
					updatedUser: { fname: user.fname, lname: user.lname, email: user.email, plainkey: user.plainkey }
				});
			})
			.catch(err => next(err));
	}
};