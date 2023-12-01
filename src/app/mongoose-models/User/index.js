const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: { type: String, require: true },
  hash: String,
  salt: String,
});
//Password hashing methods taken from this article: https://www.loginradius.com/blog/engineering/password-hashing-with-nodejs/
userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
};
userSchema.methods.validPassword = function (password) {
  var hash = crypto.pbkdf2Sync(password.toString(), this.salt, 1000, 64, `sha512`).toString(`hex`);
  return this.hash === hash;
};
const User = (module.exports = mongoose.model("User", userSchema));
