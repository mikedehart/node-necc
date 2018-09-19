const axios = require('axios');
const clientApi = require('../../api');
const config = require('../../conf/conf');
const mongoose = require('mongoose');


// Pull up login page
exports.get = function(req, res, next) {
	res.render('members/login');
};

// Log in to members area
exports.post = function(req, res, next) {
	const email = req.body.email;
	const key = req.body.sitekey
	clientApi.authUser(email, key)
		.then((user) => {
			if(!user) {
				res.render('members/login', {
					message: 'Login failed! Incorrect email / key'
				});
			} else {
				res.render('members/console', {
					name: user.fname
				});
			}
		})
		.catch((err) => next(err));
};


/* Paypal Functions
----------------------- */


// Called when user clicks paypal button
exports.getPayment = function(req, res, next) {
	const clientID = config.paypal.client_id;
	const secret = config.paypal.secret;
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
						description: 'NE Clemson Club Membership',
						item_list: {
							items: [{
								name: 'NECC Club Membership',
								description: "One-year membership for New England Clemson Club",
								quantity: '1',
								price: '25',
								sku: 'necc1',
								currency: 'USD'
							}]
						}
					}],
					note_to_payer: "Questions or issues with your order? Email us at info@newenglandclemsonclub.com",
					redirect_urls: {
						return_url: 'http://localhost:3000',
						cancel_url: 'http://localhost:3000'
					}
				},
				json: true,
				url: config.paypal.url + '/v1/payments/payment'
			};
			axios(options)
				.then((payment) => {
					res.json({ id: payment.data.id });
				})
				.catch(err => res.json({ name: err.name, message: err.message}));
		})
		.catch(err => res.json({ name: err.name, message: err.message}));
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
					payer_id: payerID
				},
				json: true,
				url: config.paypal.url + '/v1/payments/payment/' + paymentID + '/execute'
			};

			axios(options)
				.then((payment) => {
					const payState = payment.data.state;
					if(payState === 'approved' || 'completed') {

						// Sale details (need to be passed at query params)
						const sale_id = payment.data.transactions[0].related_resources[0].sale.id || "";
						const status = payment.data.transactions[0].related_resources[0].sale.state || "";
						const amt = payment.data.transactions[0].amount.total;

						// User details (used to add user to database)
						const cEmail = payment.data.payer.payer_info.email;
						const cFname = payment.data.payer.payer_info.first_name;
						const cLname = payment.data.payer.payer_info.last_name;
						const cId = payment.data.id;
						
						// create user in the DB
						clientApi.createUser(cId, cFname, cLname, cEmail)
							.then((user) => {
								if(!user) {
									//res.status(501).send('Error adding user! Duplicate email.');
									res.json({ name: 'Error adding user!', message: 'User was not added to the database!' });
								} else {
									let url = `${config.client.url}/members/${user.id}?key=${user.plainkey}\
									&sale_id=${sale_id}&status=${status}&pay_status=${payState}&amt=${amt}`;
									res.json({
										url
									});
								}
							})
							.catch((err) => res.json({ name: err.name, message: err.message}));
					} else {
						console.error('pay state not approved');
						console.error(payment.data);
						res.json({ name: payment.data.state, message: 'Payment status not approved' });

					}
				})
				.catch(err => {
					console.error(`Error calling paypal auth: ${err.stack}`);
					res.json({ name: err.data.name, message: err.message})});
		})
		.catch(err => res.json({ name: err.name, message: err.message}));
};


/* ---------- ID ROUTES ---------- */

// Called after authPayment to confirm user and key recieved, then
// re

exports.confirmation = function(req, res, next, id) {
	// Get query params
	const authKey = req.query.key;
	const sale_id = req.query.sale_id;
	const orderState = req.query.status;
	const payState = req.query.pay_status;
	const amount = req.query.amt;

	const userId = id.toString();

	if(!mongoose.Types.ObjectId.isValid(userId)) {
		res.render('error', {
			title: 'Incorrect ID sent!',
			message: 'An invalid id was received.'
		});
	} else if(!authKey) {
		res.render('members/pay-failed', {
			message: 'Authorization key not sent!'
		});
	} else {
		clientApi.getUser(userId)
			.then((user) => {
				if(!user) {
					res.render('members/pay-failed', { 
						message: 'User was not added to the database!'
					});
				} else {
					res.render('members/pay-success', {
						purchase_id: user.purchase_id,
						auth: authKey,
						email: user.email,
						name: user.fname + ' ' + user.lname,
						id: user._id,
						sale_id,
						pay_status: payState,
						order_status: orderState,
						amount
					});
				}
			})
			.catch(err => next(err));
	}
};