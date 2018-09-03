const router = require('express').Router();
const controller = require('./authController');

// run verifyUser when signin is called
const auth = require('./auth');
const verifyUser = auth.verifyUser;
const checkToken = [auth.decodeToken(), auth.verifyToken()];

// check token when checktoken is called

// When login form posts, call verifyUser to make sure user info matches.
router.post('/signin', verifyUser(), controller.signin);

// When a token exists, just need to verify it matches a user.
router.post('/checktoken', checkToken, controller.checktoken);

module.exports = router;