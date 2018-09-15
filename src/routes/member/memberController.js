const axios = require('axios');
const clientApi = require('../../api');
const config = require('../../conf/conf');
const User = require('../../api/user/userModel');


// Pull up login page
exports.get = function(req, res, next) {
	res.render('members/login');
};

// Log in to members area
exports.post = function(req, res, next) {
	res.render('members/console');
};

exports.login = function(req, res, next) {

};

/* Paypal Functions
----------------------- */


// Called when user clicks paypal button
exports.getPayment = function(req, res, next) {
	clientApi.getToken()
		.then((response) => {
			const options = {
				method: 'post',
				headers: {
					'Authorization': 'Bearer ' + response.access_token,
					'Content-Type': 'application/json'
				},
				data: {
					intent: 'sale',
					payer: {
						payment_method: 'paypal'
					},
					transactions: [{
						amount: {
							total: '25.00',
							currency: 'USD'
						},
						description: 'NE Clemson Club Membership'
					}],
					redirect_urls: {
						return_url: config.paypal.accept,
						cancel_url: config.paypal.fail
					}
				},
				json: true,
				url: config.paypal.url + '/v1/payments/payment'
			};
			axios(options)
				.then((payment) => {
					res.json({ id: payment.data.id });
				})
				.catch(err => console.error(err));
		})
		.catch(err => console.error(err));
};

// Called when user authorized payment
exports.authPayment = function(req, res, next) {
	const paymentID = req.body.paymentID;
	const payerID = req.body.payerID;

	clientApi.getToken()
		.then((response) => {
			const options = {
				method: 'post',
				headers: {
					'Authorization': 'Bearer ' + response.access_token,
					'Content-Type': 'application/json'
				},
				data: {
					payer_id: payerID,
					transactions: [{
						amount: {
							total: '25.00',
							currency: 'USD'
						}
					}]
				},
				json: true,
				url: config.paypal.url + '/v1/payments/payment/' + paymentID + '/execute'
			};

			axios(options)
				.then((payment) => {
					const payState = payment.data.state;

					if(payState === 'approved') {
						const cEmail = payment.data.payer.payer_info.email;
						const cFname = payment.data.payer.payer_info.first_name;
						const cLname = payment.data.payer.payer_info.last_name;
						const cId = payment.data.id;
						
						// create user in the DB
						clientApi.createUser(cId, cFname, cLname, cEmail)
							.then((user) => {
								if(!user) {
									res.status(500).send('Error adding user!');
								} else {
									let url = config.client.url;
									res.json({
										url,
										status: payment.data.state,
										user,
										id: user.purchase_id
									});
								}
							})
							.catch((err) => console.error(err));
					} else {
						res.send('members/pay-failed');
					}
				})
				.catch(err => console.error(err));
		})
		.catch(err => console.error(err));
};


/* ---------- ID ROUTES ---------- */


//  Called after confirmation. A valid purchase_id must
// be saved after payment approval.

exports.confirmation = function(req, res, next, id) {
	console.log(id);
	User.findOne({ purchase_id: id })
		.then((user) => {
			if(!user) {
				// send to failed page
			} else {
				// send details to user?
			}
		})
		.catch((err) => console.error(err));
};