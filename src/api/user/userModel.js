const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

let UserSchema = new Schema({
	userid: {
		type: Number,
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
		type: String
	},
	subscribed: {
		type: Boolean
	}
});

// Prior to saving user, encrypt email address
UserSchema.pre('save', function(next) {
	if(!this.isModified('email')) return next();
	this.email = this.encryptEmail(this.email);
	next();
})

UserSchema.methods = {
	authenticate: function(plainEmail) {
	return bcrypt.compareSync(plainEmail, this.email);
	},
	encryptEmail: function(plainEmail) {
		if(!plainEmail) {
			return '';
		} else {
			const salt = bcrypt.getSaltSync(10);
			return bcrypt.hashSync(plainEmail, salt);
		}
	}
};

module.exports = mongoose.model('user', UserSchema);