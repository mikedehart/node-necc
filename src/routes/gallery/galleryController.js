const clientApi = require('../../api');
const fs = require('fs');
const path = require('path');

exports.params = function(req, res, next, id) {
	clientApi.getGallery(id)
		.then((gallery) => {
			if(!gallery) {
				next(new Error('No gallery exists with that URL!'));
			} else {
				req.gallery = gallery;
				next();
			}
		})
		.catch(err => next(err));
}

exports.get = function(req, res, next) {
	clientApi.getGalleries()
		.then((galleries) => {
			const localArray = galleries;

			const imgArray = localArray.map((gallery) => {
				const imgPath = path.join(__dirname + `../../../public${gallery.path}`);
				const imgs = fs.readdirSync(imgPath);
				gallery.img = gallery.path + '/' + imgs[0];
				return gallery;
			});
			res.render('gallery', {
				albums: imgArray,
				title: 'Events'
			});
		})
};

exports.post = function(req, res, next) {
	// TODO: add new gallery
};

// At this point, req.gallery should be a valid gallery object (added by params)
exports.getOne = function(req, res, next) {
	if(!req.gallery) {
		next(new Error('No gallery was identified!'));
	} else {
		const fldrName = req.gallery.dirname;
		const imgPath = `/img/events/${fldrName}/`;
		const osFldr = path.join(__dirname, `../../public/${imgPath}`);
		let imgs = [];
		fs.readdir(osFldr, (err, files) => {
			if(err) {
				next(new Error('Invalid image path!'));
				return;
			} else {
				files.forEach((file) => {
					imgs.push(file);
				});
				res.render('album', {
					path: imgPath,
					imgs: imgs,
					imgtitle: req.gallery.title,
					title: 'Events'
				});
			}
		});
	}
};