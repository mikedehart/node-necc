const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let GalSchema = new Schema({
	title: {
		type: String,
		required: true,
		unique: true
	},
	path: {
		type: String,
		required: true
	},
	dirname: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('gallery', GalSchema);