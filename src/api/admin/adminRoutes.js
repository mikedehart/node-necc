const router = require('express').Router();
const controller = require('./adminController');
const auth = require('../../auth/auth');

/*

Routes closed off in production.

No need to add/modify admin users. Using one for all admins for now.

---------------------------------- */

//router.param('id', controller.params);

// router.route('/')
// 	.get(controller.get) // get all admins
// 	.post(controller.post) // create new admin

// router.route('/:id')
// 	.get(controller.getOne) // get admin with ID
// 	.put(controller.put) // update admin by ID
// 	.delete(controller.delete) // delete admin by ID

module.exports = router;