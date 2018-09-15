const router = require('express').Router();
const controller = require('./adminController');


router.route('/')
	.get(controller.get) // Get Admin login page (or console if JWT valid)
	.post(controller.post) // Login route


module.exports = router;