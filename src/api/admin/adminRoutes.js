const router = require('express').Router();
const controller = require('./adminController');
const auth = require('../../auth/auth');


const authMiddleware = [auth.decodeToken(), auth.verifyToken()];


router.param('id', controller.params);

router.route('/')
	.get(controller.get) // get all admins
	.post(controller.post) // create new admin

router.route('/:id')
	.get(controller.getOne) // get admin with ID
	.put(controller.put) // update admin by ID
	.delete(controller.delete) // delete admin by ID

module.exports = router;