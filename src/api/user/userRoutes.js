const router = require('express').Router();
const controller = require('./userController');
const auth = require('../../auth/auth');

router.param('id', controller.params);

router.route('/')
	.get(controller.get) // get all users
	.post(controller.post) // create a user

router.route('/lookup')
	.post(controller.lookup) // lookup ID based on email/key

router.route('/:id')
	.get(controller.getOne) // get user by id
	.put(controller.put) // update user by id
	.delete(controller.delete) // delete user by id

module.exports = router;
