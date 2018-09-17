const User = require('./userModel');
const signToken = require('../../auth/auth').signToken;
const keygen = require('random-key');

exports.params = function(req, res, next, id) {
	User.findById(id)
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
  User.find({})
    .then(function(users){
      res.json(users);
    }, function(err){
      next(err);
    });
};

exports.post = function(req, res, next) {
	let newUser = new User(req.body);
  let siteKey = keygen.generate(10);

  newUser.sitekey = siteKey;

  console.log('Key: '+ newUser.sitekey);

  newUser.save((err, user) => {
    if(err) {
      //return next(err);
      console.log('ERROR! Saving User (User Controller): ' + err);
      res.status(500).send('Error saving user: ' + err);
    } else {

      let userObj = {
        name: `${user.fname} ${user.lname}`,
        id: user._id,
        pid: user.purchase_id,
        email: user.email,
        plainkey: siteKey,
        hashkey: user.sitekey
      };

      console.log(`UserObj: ${userObj.plainkey} - ${userObj.id}`);
      console.log('AUTH: ' + user.authenticate(userObj.plainkey));

      res.json(userObj);
    }
  });

};


// -------- ID Routes --------

exports.getOne = function(req, res, next) {
  let user = req.user;
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