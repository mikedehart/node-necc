const router = require('express').Router();
const controller = require('./galleryController');
const path = require('path');

// File upload middleware
const multer = require('multer');
const galPath = path.join(__dirname + `../../../public/img/events/`);
console.log(galPath);
const storage = multer.diskStorage({ dest: galPath });
const upload = multer({ storage: storage });


router.param('id', controller.params);

router.route('/')
	.get(controller.get) // Get gallery index page
	.post(upload.single('gFile'), controller.post) // Submit a new gallery


router.route('/:id') // dirname to determine which gallery to show
	.get(controller.getOne) // Return img gallery based on dirname

module.exports = router;