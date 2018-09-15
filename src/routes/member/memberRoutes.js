const router = require('express').Router();
const controller = require('./memberController');


router.route('/')
	.get(controller.get) // Get members login page
	.post(controller.login); // Login route


router.route('/create')
	.post(controller.getPayment); // Create payment obj

router.route('/authorize')
	.post(controller.authPayment); // Verify payment obj

router.route('/:id')
	.get(controller.confirmation); // Confirmation screen

module.exports = router;