const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');


let AdminSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	// Dont store password as plain text!
	password: {
		type: String,
		required: true
	}
});

// Prior to saving user, encrypt password
AdminSchema.pre('save', function(next) {
	if(!this.isModified('password')) return next();
	this.password = this.encryptPassword(this.password);
	next();
})

AdminSchema.methods = {
	// Check passwords on signin
	authenticate: function(plainTxtPw) {
		return bcrypt.compareSync(plainTxtPw, this.password);
	},
	// hash the password
	encryptPassword: function(plainTxtPw) {
		if(!plainTxtPw) {
			return '';
		} else {
			const salt = bcrypt.genSaltSync(10);
			return bcrypt.hashSync(plainTxtPw, salt);
		}
	},
	// Remove password when returning object (maybe not needed?)
	toJson: function() {
		let obj = this.toObject();
		delete obj.password;
		return obj;
	}
};

module.exports = mongoose.model('admin', AdminSchema);