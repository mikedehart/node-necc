/*
	API router for database endpoints.

	Exported to main.js
*/

const router = require('express').Router();
const adminRoutes = require('./admin/adminRoutes');

// Mounting other routers for our routes (right now just for user information)
router.use('/admin', require('./admin/adminRoutes'));
router.use('/gallery', require('./gallery/galRoutes'));
router.use('/user', require('./user/userRoutes'));

module.exports = router;