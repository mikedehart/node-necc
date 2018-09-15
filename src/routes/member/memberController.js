const axios = require('axios');
const clientApi = require('../../api');
const config = require('../../conf/conf');


// Pull up login page
exports.get = function(req, res, next) {
	res.render('members/login');
};

// Log in to members area
exports.post = function(req, res, next) {

};


// create new user
exports.newUser = function(req, res, next) {

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
					console.log(payment.data.state);
					console.log(payment.data.payer.payer_info.email);
					console.log(payment.data.payer.payer_info.first_name);
					console.log(payment.data.payer.payer_info.last_name);
					console.log(payment.data.id);
					console.log(payment.data.create_time);
					if(payment.data.state === 'approved') {
						console.log('success');
						res.json(payment.data);
					} else {
						res.send('members/paypal_failed');
					}
				})
				//ERROR HERE
				.catch(err => console.error(err));
		})
		.catch(err => console.error('OUTER ERROR: '+err));
};

exports.confirmation = function(req, res, next) {
	const _status = req.body.status;
	console.log('is this still being called?');
	if(_status === 'success') {
		res.render('members/paypal_success');
	} else {
		res.render('members/paypal_failed');
	}
};