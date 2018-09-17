const Gallery = require('./galModel');
const _ = require('lodash');

exports.params = function(req, res, next, id) {
	// Add user to req.gallery
	Gallery.findOne({ dirname: id })
		.then((gallery) => {
			if(!gallery) {
				res.status(401).send('No user with given id');
				//next(new Error('No gallery that matches!'));
			} else {
				req.gallery = gallery;
				next();
			}
		}, (err) => {
      console.log(err);
			next(err);
		});
};

// -------- Root Routes --------

// Get all galleries
exports.get = function(req, res, next) {
  Gallery.find({})
    .then(function(gallery){
      res.json(gallery);
    }, function(err){
      next(err);
    });
};

// Create new gallery
exports.post = function(req, res, next) {
	let newGallery = new Gallery(req.body);

	newGallery.save((err, saved) => {
		if(err) {
			return next(err);
		} else {
			res.json(saved);
		}
	});
};


// -------- ID Routes --------

// Get single gallery (by dirname)
exports.getOne = function(req, res, next) {
  var gallery = req.gallery;
  res.json(gallery);
};

// Update gallery (by dirname)
exports.put = function(req, res, next) {
  var gallery = req.gallery;

  var update = req.body;

  _.merge(gallery, update);

  gallery.save(function(err, saved) {
    if (err) {
      next(err);
    } else {
      res.json(saved);
    }
  })
};


// Delete gallery (by dirname)
exports.delete = function(req, res, next) {
  console.log(req.gallery);
  req.gallery.remove(function(err, removed) {
    if (err) {
      next(err);
    } else {
      res.json(removed);
    }
  });
};

exports.me = function(req, res) {
  res.json(req.gallery.toJson());
};