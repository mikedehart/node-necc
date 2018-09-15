const router = require('express').Router();
const controller = require('./galleryController');

router.param('id', controller.params);

router.route('/')
	.get(controller.get) // Get gallery index page
	.post(controller.post) // Submit a new gallery

router.route('/:id') // dirname to determine which gallery to show
	.get(controller.getOne) // Return img gallery based on dirname

module.exports = router;