const clientApi = require('../../api');
const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');

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
	// Text vars
	const title = req.body.gTitle;
	const date = req.body.gMonth + ' ' + req.body.gYear;
	const text = req.body.gTxt;
	let dir = req.body.gDir
	dir = dir.replace(' ','');
	const imgpath = `/img/events/${dir}`;
	const fullpath = path.join(__dirname + `../../../public${imgpath}`);
	// File vars
	const filename = req.file.filename;
	const filePath = req.file.path;

	// JWT
	const cookie = req.signedCookies['necc_token'];

	// First, we need to check for JWT auth
	if(cookie) {
		// Then, check for file, create directory, and extract it
		if(req.file) {
			// Create the directory
			if(!fs.existsSync(fullpath)) {
				fs.mkdir(fullpath, function(err) {
					if(err) {
						res.render('error', {
							title: 'Error creating directory',
							message: 'An error was thrown attempting to create the directory'
						});
					} else {
						extract(filePath, { dir: fullpath }, function(err) {
							if(err) {
								return res.render('error', {
									title: err,
									message: err.stack
								});
							} else {
								fs.readdir(fullpath, (err, files) => {
									if(err) {
										return res.render('error', {
											title: err,
											message: err.stack
										});
									} else {
										clientApi.addGallery(title, imgpath, dir, date, text, cookie)
											.then((gallery) => {
												if(!gallery) {
													return res.render('error', {
														title: 'Gallery not added!',
														message: 'Adding gallery to db failed for some reason...'
													});
												} else {
													return res.send('Gallery successfully added! Sorry this page isnt prettier. Click refresh to see image galleries');
												}
											})
											.catch(err => next(err));
									}
								});
							}
						});

					}
				});
			} else {
				// Path does exist...
				res.render('error', {
					title: 'Directory already exists',
					message: 'Chosen directory name already exists!'
				});
			}
		} else {
			res.render('error', {
				title: 'No zip file uploaded',
				message: 'Make sure a zip file is chosen'
			});
		}
	} else { // no cookie
		res.render('error', {
			title: 'No JWT token found',
			message: 'Try to re-login to admin console'
		});
	}
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