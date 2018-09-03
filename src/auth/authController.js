const signToken = require('./auth').signToken;

exports.signin = function(req, res, next) {
	// req.user will be here from verifyUser() middleware.
	// now we just sign token and send it back to client.
	const token = signToken(req.user._id);
	//res.json({ token: token });
	res.send(token);
};

// Simple verification to make sure token does decode to
// user id.
exports.checktoken = function(req, res, next) {
	if(req.user) {
		res.send(true);
	} else {
		res.send(false);
	}
};