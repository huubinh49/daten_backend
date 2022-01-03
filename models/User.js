const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12

const UserSchema = new mongoose.Schema({
    googleId: String,
    facebookId: String,
    name: String,
    email: { type: String, required: true, lowercase: true, unique: true },
    password: String,
    profile: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Profile", 
      required: false,
      default: null
    },
    isAdmin: {type: Boolean, default: false} 
}, {
  timestamps: true,
})

UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    // remove the password property when serializing doc to JSON
    delete ret.password
    return ret
  },
})

UserSchema.pre('save', function (next) {
  const account = this
  if (!account.isModified('password')) return next()
  bcrypt.hash(account.password, SALT_ROUNDS)
  .then(hash => {
    account.password = hash
    next()
  })
  .catch(err => {
    next(err)
  })
})

UserSchema.methods.comparePassword = function (tryPassword, cb) {
  bcrypt.compare(tryPassword, this.password, cb)
}

module.exports = User = mongoose.model('User', UserSchema)