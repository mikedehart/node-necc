const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const keygen = require('random-key');

let UserSchema = new Schema({
	fname: {
		type: String,
	},
	lname: {
		type: String
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	subscribed: {
		type: Boolean
	},
	signdate: {
		type: Date,
		required: true
	},
	sitekey: {
		type: String,
		unique: true,
		required: true
	}
});

// Prior to saving user, encrypt site key
UserSchema.pre('save', function(next) {
	if(!this.isModified('sitekey')) return next();
	console.log('plain key: ' + this.sitekey);
	this.sitekey = this.encryptKey(this.sitekey);
	next();
})

UserSchema.methods = {
	authenticate: function(plainKey) {
	return bcrypt.compareSync(plainKey, this.sitekey);
	},
	encryptKey: function(plainKey) {
		if(!plainKey) {
			return '';
		} else {
			console.log('encrypting...');
			const salt = bcrypt.genSaltSync(10);
			return bcrypt.hashSync(plainKey, salt);
		}
	}
};

module.exports = mongoose.model('user', UserSchema);