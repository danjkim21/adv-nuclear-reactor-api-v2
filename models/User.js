const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
mongoose.promise = Promise;

const userSchema = new Schema({
  username: {
    type: String,
    unique: false,
    required: false,
  },
  password: {
    type: String,
    unique: false,
    required: false,
  },
  email: {
    type: String,
    unique: true,
    required: false,
  },
  role: {
    type: String,
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
  hashPassword: (plainTextPassword) => {
    return bcrypt.hashSync(plainTextPassword, 10);
  },
};

userSchema.pre('save', function (next) {
  if (!this.password) {
    console.log('models/user.js =======NO PASSWORD PROVIDED=======');
    next();
  } else {
    console.log('models/user.js hashPassword in pre save');
    this.password = this.hashPassword(this.password);
    next();
  }
});

module.exports = mongoose.model('User', userSchema);
