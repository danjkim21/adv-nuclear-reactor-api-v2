const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
mongoose.promise = Promise;

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    unique: false,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    required: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    unique: false,
    required: false,
  },
  verified: {
    type: Boolean,
    default: false,
    unique: false,
    required: true,
  },
  organization: {
    type: String,
    unique: false,
    required: false,
  },
});

userSchema.methods = {
  checkPassword: function (inputPassword) {
    return bcrypt.compareSync(inputPassword, this.password);
  },
  hashPassword: function (plainTextPassword) {
    return bcrypt.hashSync(plainTextPassword, 10);
  },
};

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = this.hashPassword(this.password);
  next();
});

module.exports = mongoose.model('User', userSchema);
