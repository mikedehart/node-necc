const router = require('express').Router();
const controller = require('./authController');

// run verifyUser when signin is called
const verifyUser = require('./auth').verifyUser;

// When login form posts, call verifyUser to make sure user info matches.
router.post('/signin', verifyUser(), controller.signin);

module.exports = router;