import { InferSchemaType } from 'mongoose';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
mongoose.promise = Promise;

const UserSchema = new Schema({
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
});

export type UserType = InferSchemaType<typeof UserSchema>;

// TODO: Fix UserSchema methods typing and 'this' ignored warnings
UserSchema.methods = {
  checkPassword: (inputPassword: any) => {
    // @ts-ignore
    return bcrypt.compareSync(inputPassword, this.password);
  },
  hashPassword: (plainTextPassword: any) => {
    return bcrypt.hashSync(plainTextPassword, 10);
  },
};

UserSchema.pre('save', function (next: () => void) {
  // @ts-ignore
  if (!this.password) {
    console.log('models/user.js =======NO PASSWORD PROVIDED=======');
    next();
  } else {
    console.log('models/user.js hashPassword in pre save');
    // @ts-ignore
    this.password = this.hashPassword(this.password);
    next();
  }
});

module.exports = mongoose.model('User', UserSchema);
