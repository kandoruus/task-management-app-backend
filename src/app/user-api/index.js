const express = require("express");
const app = (module.exports = express());
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const User = require("mongoose-models/User");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

//Handle use signup
app.post("/user-api/signup", async (req, res) => {
  //Validate credentials
  const { username, password } = req.body;
  if ((await User.findOne({ username: username })) !== null) {
    res.status(400).send({ message: "The username " + username + " is already taken." });
  } else if (password.length < 9) {
    res.status(400).send({ message: "The password must be at least 8 characters long." });
  } else if (username.length < 3) {
    res.status(400).send({ message: "The username must be at least 3 characters long." });
  } else {
    //add new User
    let newUser = new User();
    newUser.username = username;
    newUser.password = password;
    newUser.setPassword(password);
    newUser.save((err, User) => {
      if (err) {
        return res.status(400).send({ message: "Failed to add user." });
      } else {
        return res.status(201).send({
          message: "Account for " + username + " successfully created!",
          username: username,
        });
      }
    });
  }
});

//Validate a login attempt
app.post("/user-api/login", async (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username: username }, function (err, user) {
    if (user === null) {
      return res.status(400).send({ message: "The username or password is incorrect." });
    } else if (user.validPassword(password)) {
      return res.status(201).send({ message: "Welcome " + username + "!", username: username });
    } else {
      return res.status(400).send({ message: "The username or password is incorrect." });
    }
  });
});

//change password
app.post("/user-api/change-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  User.findOne({ username: username }, function (err, user) {
    if (user === null) {
      return res.status(400).send({ message: "The username is incorrect." });
    } else if (!user.validPassword(oldPassword)) {
      return res.status(400).send({ message: "The password is incorrect." });
    } else if (newPassword.length < 9) {
      res.status(400).send({ message: "The new password must be at least 8 characters long." });
    } else {
      user.setPassword(newPassword);
      user.save((err, User) => {
        if (err) {
          return res.status(400).send({ message: "Failed to change password." });
        } else {
          return res.status(201).send({ message: "Password successfully updated." });
        }
      });
    }
  });
});

//delete user
app.post("/user-api/delete-account", async (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username: username }, function (err, user) {
    if (user === null) {
      return res.status(400).send({ message: "The username is incorrect." });
    } else if (user.validPassword(password)) {
      User.findByIdAndDelete(user._id, (err, User) => {
        if (err) {
          return res.status(400).send({ message: "Failed to delete account." });
        } else {
          return res.status(201).send({ message: "Account successfully deleted." });
        }
      });
    } else {
      return res.status(400).send({ message: "The password is incorrect." });
    }
  });
});
