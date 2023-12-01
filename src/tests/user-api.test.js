const mongoose = require("mongoose");
const request = require("supertest");
const app = require("user-api");
const User = require("mongoose-models/User");
require("dotenv").config();

const existingUsername = "existingUsername";
const existingUsersPassword = "existingUsersPassword";
const validNewPassword = "validNewPassword";
const newUserName = "newUsername";
const newUsersPassword = "newUsersPassword";
const badPassword = "1234567";
const badUsername = "12";
const invalidUsername = "invalidUsername";
const invalidPassword = "invalidPassword";

describe("User API", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    await User.deleteMany({});
  });
  beforeEach(async () => {
    let existingUser = new User();
    existingUser.username = existingUsername;
    existingUser.password = existingUsersPassword;
    existingUser.setPassword(existingUsersPassword);
    await existingUser.save();
  });
  afterEach(async () => {
    await User.deleteMany({});
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
  describe("when it receives post requests at /user-api/signup", () => {
    it("responds with a confirmation message and the new account name when the provided credentials are valid", async () => {
      const res = await request(app)
        .post("/user-api/signup")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ username: newUserName, password: newUsersPassword });
      expect(res.body.message).toBe("Account for " + newUserName + " successfully created!");
      expect(res.body.username).toBe(newUserName);
    });
    it("responds with the appropriate error message when the username already exists", async () => {
      const res = await request(app)
        .post("/user-api/signup")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ username: existingUsername, password: newUsersPassword });
      expect(res.body.message).toBe("The username " + existingUsername + " is already taken.");
    });
    it("responds with the appropriate error message when the username is too short", async () => {
      const res = await request(app)
        .post("/user-api/signup")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ username: badUsername, password: newUsersPassword });
      expect(res.body.message).toBe("The username must be at least 3 characters long.");
    });
    it("responds with the appropriate error message when the password is too short", async () => {
      const res = await request(app)
        .post("/user-api/signup")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ username: newUserName, password: badPassword });
      expect(res.body.message).toBe("The password must be at least 8 characters long.");
    });
  });
  describe("when it receives post requests at /user-api/login", () => {
    it("responds with a welcome message and the account name when the provided credentials are valid", async () => {
      const res = await request(app)
        .post("/user-api/login")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ username: existingUsername, password: existingUsersPassword });
      expect(res.body.message).toBe("Welcome " + existingUsername + "!");
      expect(res.body.username).toBe(existingUsername);
    });
    it("responds with the appropriate error message when the username is invalid", async () => {
      const res = await request(app)
        .post("/user-api/login")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ username: invalidUsername, password: existingUsersPassword });
      expect(res.body.message).toBe("The username or password is incorrect.");
    });
    it("responds with the appropriate error message when the password is invalid", async () => {
      const res = await request(app)
        .post("/user-api/login")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ username: existingUsername, password: invalidPassword });
      expect(res.body.message).toBe("The username or password is incorrect.");
    });
  });
  describe("when it receives post requests at /user-api/change-password", () => {
    it("responds with the appropriate confirmation message when the provided credentials are valid", async () => {
      const res = await request(app)
        .post("/user-api/change-password")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({
          username: existingUsername,
          oldPassword: existingUsersPassword,
          newPassword: validNewPassword,
        });
      expect(res.body.message).toBe("Password successfully updated.");
    });
    it("responds with the appropriate error message when the username is invalid", async () => {
      const res = await request(app)
        .post("/user-api/change-password")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({
          username: invalidUsername,
          oldPassword: existingUsersPassword,
          newPassword: validNewPassword,
        });
      expect(res.body.message).toBe("The username is incorrect.");
    });
    it("responds with the appropriate error message when the old password is invalid", async () => {
      const res = await request(app)
        .post("/user-api/change-password")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({
          username: existingUsername,
          oldPassword: invalidPassword,
          newPassword: validNewPassword,
        });
      expect(res.body.message).toBe("The password is incorrect.");
    });
    it("responds with the appropriate error message when the new password is invalid", async () => {
      const res = await request(app)
        .post("/user-api/change-password")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({
          username: existingUsername,
          oldPassword: existingUsersPassword,
          newPassword: badPassword,
        });
      expect(res.body.message).toBe("The new password must be at least 8 characters long.");
    });
  });
  describe("when it receives post requests at /user-api/delete-account", () => {
    it("responds with the appropriate confirmation message when the provided credentials are valid", async () => {
      const res = await request(app)
        .post("/user-api/delete-account")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ username: existingUsername, password: existingUsersPassword });
      expect(res.body.message).toBe("Account successfully deleted.");
    });
    it("responds with the appropriate error message when the username is invalid", async () => {
      const res = await request(app)
        .post("/user-api/delete-account")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ username: invalidUsername, password: existingUsersPassword });
      expect(res.body.message).toBe("The username is incorrect.");
    });
    it("responds with the appropriate error message when the password is invalid", async () => {
      const res = await request(app)
        .post("/user-api/delete-account")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ username: existingUsername, password: invalidPassword });
      expect(res.body.message).toBe("The password is incorrect.");
    });
  });
});
