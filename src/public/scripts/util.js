/* Utility scripts used in main.js mostly */

const fs = require('fs');

exports.appendImg = function(gallery, cb) {
	//console.log(gallery);
	const imgPath = (__dirname + `/../${gallery.path}`);
	fs.readdir(imgPath, (err, imgs) => {
		if(err) {
			return console.log(err);
		} else {
			return cb(gallery.path + '/' + imgs[0]);
		}
	});
};