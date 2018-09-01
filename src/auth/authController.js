const signToken = require('./auth').signToken;

exports.signin = function(req, res, next) {
	// req.user will be here from verifyUser() middleware.
	// now we just sign token and send it back to client.
	const token = signToken(req.user._id);
	//res.json({ token: token });
	res.send(token);
};

//TODO Work Here!
// need to pass token, set it in client, check for it etc