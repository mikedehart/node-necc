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
		required: true,
		unique: true
	},
	evtdate: {
		type: String,
	},
	text: {
		type: String,
	}
});

module.exports = mongoose.model('gallery', GalSchema);