const Admin = require('./adminModel');
const signToken = require('../../auth/auth').signToken;

exports.params = function(req, res, next, id) {
	// Add user to req.user (and remove password!)
	Admin.findById(id)
		.select('-password')
		.exec()
		.then((user) => {
			if(!user) {
				res.status(401).send('No user with given id');
				//next(new Error('No user with given Id!'));
			} else {
				req.user = user;
				next();
			}
		}, (err) => {
			next(err);
		});
};

// -------- Root Routes --------

exports.get = function(req, res, next) {
  Admin.find({})
    .then(function(users){
      res.json(users);
    }, function(err){
      next(err);
    });
};

exports.post = function(req, res, next) {
	let newAdmin = new Admin(req.body);

	newAdmin.save((err, adm) => {
		if(err) {
			return next(err);
		}
		let token = signToken(adm._id);
		res.json({ token: token });
	});
};


// -------- ID Routes --------

exports.getOne = function(req, res, next) {
  var user = req.user;
  res.json(user);
};

exports.put = function(req, res, next) {
  var user = req.user;

  var update = req.body;

  _.merge(user, update);

  user.save(function(err, saved) {
    if (err) {
      next(err);
    } else {
      res.json(saved);
    }
  })
};

exports.delete = function(req, res, next) {
  req.user.remove(function(err, removed) {
    if (err) {
      next(err);
    } else {
      res.json(removed);
    }
  });
};

exports.me = function(req, res) {
  res.json(req.user.toJson());
};