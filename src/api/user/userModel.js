const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

let UserSchema = new Schema({
	purchase_id: {
		type: String,
		required: true,
		unique: true
	},
	fname: {
		type: String
	},
	lname: {
		type: String
	},
	email: {
		type: String,
		required: true
	},
	subscribed: {
		type: Boolean,
		default: false
	},
	signdate: {
		type: Date,
		default: new Date()
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