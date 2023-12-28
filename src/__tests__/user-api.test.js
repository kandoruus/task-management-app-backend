const mongoose = require("mongoose");
const request = require("supertest");
const app = require("user-api");
const User = require("mongoose-models/User");
require("dotenv").config();

describe("User API", () => {
  const existingUsername = "existingUsername";
  const existingUsersPassword = "existingUsersPassword";
  const validNewPassword = "validNewPassword";
  const newUserName = "newUsername";
  const newUsersPassword = "newUsersPassword";
  const badPassword = "1234567";
  const badUsername = "12";
  const invalidUsername = "invalidUsername";
  const invalidPassword = "invalidPassword";
  const validSessionCode = "validSessionCode";
  const invalidSessionCode = "invalidSessionCode";

  const postWithHeaders = (url, payload) => {
    return request(app)
      .post(url)
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send(payload);
  };

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
    existingUser.sessionCode = validSessionCode;
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
    const postSignup = (payload) => postWithHeaders("/user-api/signup", payload);
    it("responds with a confirmation message and the new account name when the provided credentials are valid", async () => {
      const res = await postSignup({ username: newUserName, password: newUsersPassword });
      expect(res.body.message).toBe("Account for " + newUserName + " successfully created!");
      expect(res.body.username).toBe(newUserName);
    });
    it("responds with the appropriate error message when the username already exists", async () => {
      const res = await postSignup({ username: existingUsername, password: newUsersPassword });
      expect(res.body.message).toBe("The username " + existingUsername + " is already taken.");
    });
    it("responds with the appropriate error message when the username is too short", async () => {
      const res = await postSignup({ username: badUsername, password: newUsersPassword });
      expect(res.body.message).toBe("The username must be at least 3 characters long.");
    });
    it("responds with the appropriate error message when the password is too short", async () => {
      const res = await postSignup({ username: newUserName, password: badPassword });
      expect(res.body.message).toBe("The password must be at least 8 characters long.");
    });
  });
  describe("when it receives post requests at /user-api/login", () => {
    const postLogin = (payload) => postWithHeaders("/user-api/login", payload);
    it("responds with a welcome message and the account name when the provided credentials are valid", async () => {
      const res = await postLogin({ username: existingUsername, password: existingUsersPassword });
      expect(res.body.message).toBe("Welcome " + existingUsername + "!");
      expect(res.body.username).toBe(existingUsername);
      expect(res.body.userId).not.toBeNull();
    });
    it("responds with the appropriate error message when the username is invalid", async () => {
      const res = await postLogin({ username: invalidUsername, password: existingUsersPassword });
      expect(res.body.message).toBe("The username or password is incorrect.");
    });
    it("responds with the appropriate error message when the password is invalid", async () => {
      const res = await postLogin({ username: existingUsername, password: invalidPassword });
      expect(res.body.message).toBe("The username or password is incorrect.");
    });
  });
  describe("when it receives post requests at /user-api/logout", () => {
    const postLogout = (payload) => postWithHeaders("/user-api/logout", payload);
    it("responds with a confirmation message when provided credentials are valid", async () => {
      const res = await postLogout({
        username: existingUsername,
        sessionCode: validSessionCode,
      });
      expect(res.body.message).toBe("Session ended.");
    });
    it("responds with an appropriate error message when provided username is invalid", async () => {
      const res = await postLogout({
        username: invalidUsername,
        sessionCode: validSessionCode,
      });
      expect(res.body.message).toBe("Unable to validate session. Please login again to continue.");
    });
    it("responds with an appropriate error message when provided sessionCode is invalid", async () => {
      const res = await postLogout({
        username: existingUsername,
        sessionCode: invalidSessionCode,
      });
      expect(res.body.message).toBe("Unable to validate session. Please login again to continue.");
    });
  });
  describe("when it receives post requests at /user-api/change-password", () => {
    const postChangePassword = (payload) => postWithHeaders("/user-api/change-password", payload);
    it("responds with the appropriate confirmation message when the provided credentials are valid", async () => {
      const res = await postChangePassword({
        username: existingUsername,
        oldPassword: existingUsersPassword,
        newPassword: validNewPassword,
        sessionCode: validSessionCode,
      });
      expect(res.body.message).toBe("Password successfully updated.");
    });
    it("responds with the appropriate error message when the username is invalid", async () => {
      const res = await postChangePassword({
        username: invalidUsername,
        oldPassword: existingUsersPassword,
        newPassword: validNewPassword,
        sessionCode: validSessionCode,
      });
      expect(res.body.message).toBe("Unable to validate session. Please login again to continue.");
    });
    it("responds with the appropriate error message when the sessionCode is invalid", async () => {
      const res = await postChangePassword({
        username: existingUsername,
        oldPassword: existingUsersPassword,
        newPassword: validNewPassword,
        sessionCode: invalidSessionCode,
      });
      expect(res.body.message).toBe("Unable to validate session. Please login again to continue.");
    });
    it("responds with the appropriate error message when the old password is invalid", async () => {
      const res = await postChangePassword({
        username: existingUsername,
        oldPassword: invalidPassword,
        newPassword: validNewPassword,
        sessionCode: validSessionCode,
      });
      expect(res.body.message).toBe("The password is incorrect.");
    });
    it("responds with the appropriate error message when the new password is invalid", async () => {
      const res = await postChangePassword({
        username: existingUsername,
        oldPassword: existingUsersPassword,
        newPassword: badPassword,
        sessionCode: validSessionCode,
      });
      expect(res.body.message).toBe("The new password must be at least 8 characters long.");
    });
  });
  describe("when it receives post requests at /user-api/delete-account", () => {
    const postDeleteAccount = (payload) => postWithHeaders("/user-api/delete-account", payload);
    it("responds with the appropriate confirmation message when the provided credentials are valid", async () => {
      const res = await postDeleteAccount({
        username: existingUsername,
        password: existingUsersPassword,
        sessionCode: validSessionCode,
      });
      expect(res.body.message).toBe("Account successfully deleted.");
    });
    it("responds with the appropriate error message when the username is invalid", async () => {
      const res = await postDeleteAccount({
        username: invalidUsername,
        password: existingUsersPassword,
        sessionCode: validSessionCode,
      });
      expect(res.body.message).toBe("Unable to validate session. Please login again to continue.");
    });
    it("responds with the appropriate error message when the sessionCode is invalid", async () => {
      const res = await postDeleteAccount({
        username: existingUsername,
        password: existingUsersPassword,
        sessionCode: invalidSessionCode,
      });
      expect(res.body.message).toBe("Unable to validate session. Please login again to continue.");
    });
    it("responds with the appropriate error message when the password is invalid", async () => {
      const res = await postDeleteAccount({
        username: existingUsername,
        password: invalidPassword,
        sessionCode: validSessionCode,
      });
      expect(res.body.message).toBe("The password is incorrect.");
    });
  });
});
