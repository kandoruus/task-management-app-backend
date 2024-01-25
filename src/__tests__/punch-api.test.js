const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");
const request = require("supertest");
const app = require("punch-api");
const Punch = require("mongoose-models/Punch");
require("dotenv").config();

const validPunchIn = "100";
const validPunchIn2 = "120";
const invalidPunchIn = "invalidPunchIn";
const validPunchOut = "110";
const validPunchOut2 = "130";
const invalidPunchOut = "invalidPunchOut";
const blankInput = "";
const validTaskId1 = "655e5b359862131b75591e51";
const validTaskId2 = "655e5b359862131b75591e52";
const invalidTaskId = "invalidTaskId";
const validUserId1 = "655e5b359862131b75591e41";
const validUserId2 = "655e5b359862131b75591e42";
const invalidUserId = "invalidUserId";
const invalidPunchId = "invalidPunchId";
const validPunchId = "655e5b359862131b75591e66";
const existingPunches = [
  {
    _id: new ObjectID("655e5b359862131b75591e61"),
    punchIn: validPunchIn,
    taskId: validTaskId1,
    userId: validUserId1,
    __v: 0,
  },
  {
    _id: new ObjectID("655e5b359862131b75591e62"),
    punchIn: validPunchIn,
    punchOut: validPunchOut,
    taskId: validTaskId1,
    userId: validUserId1,
    __v: 0,
  },
  {
    _id: new ObjectID("655e5b359862131b75591e63"),
    punchIn: validPunchIn,
    punchOut: validPunchOut,
    taskId: validTaskId2,
    userId: validUserId1,
    __v: 0,
  },
  {
    _id: new ObjectID("655e5b359862131b75591e64"),
    punchIn: validPunchIn,
    punchOut: validPunchOut,
    taskId: validTaskId1,
    userId: validUserId2,
    __v: 0,
  },
  {
    _id: new ObjectID("655e5b359862131b75591e65"),
    punchIn: validPunchIn,
    punchOut: validPunchOut,
    taskId: validTaskId2,
    userId: validUserId2,
    __v: 0,
  },
];

const postWithHeaders = (url, payload) => {
  return request(app)
    .post("/punch-api/" + url)
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send(payload);
};

describe("Punch API", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    await Punch.deleteMany({});
  });
  beforeEach(async () => {
    for (const punch of existingPunches) {
      await Punch.create(punch);
    }
  });
  afterEach(async () => {
    await Punch.deleteMany({});
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
  describe("when it receives post requests at create-punch", () => {
    const postCreatePunch = (payload) => postWithHeaders("create-punch", payload);
    it("sends the expected success message when all request inputs are defined and valid", async () => {
      const res = await postCreatePunch({
        punchIn: validPunchIn,
        punchOut: validPunchOut,
        taskId: validTaskId1,
        userId: validUserId1,
      });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Punched created successfully.");
      expect(res.body.id).not.toBe(undefined);
    });
    it("sends the expected success message when all request inputs are valid and punchout is undefined", async () => {
      const res = await postCreatePunch({
        punchIn: validPunchIn,
        taskId: validTaskId1,
        userId: validUserId1,
      });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Punched created successfully.");
      expect(res.body.id).not.toBe(undefined);
    });
    it("sends the expected error message when punchin is invalid", async () => {
      const res = await postCreatePunch({
        punchIn: invalidPunchIn,
        punchOut: validPunchOut,
        taskId: validTaskId1,
        userId: validUserId1,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Punch validation failed: punchIn: Cast to Number failed for value "NaN" (type number) at path "punchIn"'
      );
      expect(res.body.id).toBe(undefined);
    });
    it("sends the expected error message when punchout is invalid", async () => {
      const res = await postCreatePunch({
        punchIn: validPunchIn,
        punchOut: invalidPunchOut,
        taskId: validTaskId1,
        userId: validUserId1,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Punch validation failed: punchOut: Cast to Number failed for value "NaN" (type number) at path "punchOut"'
      );
      expect(res.body.id).toBe(undefined);
    });
    it("sends the expected error message when taskid is invalid", async () => {
      const res = await postCreatePunch({
        punchIn: validPunchIn,
        punchOut: validPunchOut,
        taskId: invalidTaskId,
        userId: validUserId1,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Punch validation failed: taskId: Cast to ObjectId failed for value "' +
          invalidTaskId +
          '" (type string) at path "taskId"'
      );
      expect(res.body.id).toBe(undefined);
    });
    it("sends the expected error message when userid is invalid", async () => {
      const res = await postCreatePunch({
        punchIn: validPunchIn,
        punchOut: validPunchOut,
        taskId: validTaskId1,
        userId: invalidUserId,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Punch validation failed: userId: Cast to ObjectId failed for value "' +
          invalidUserId +
          '" (type string) at path "userId"'
      );
      expect(res.body.id).toBe(undefined);
    });
  });
  describe("when it receives post requests at punch-in", () => {
    const postPunchIn = (payload) => postWithHeaders("punch-in", payload);
    it("sends the expected success message when all request inputs are valid", async () => {
      const res = await postPunchIn({
        punchIn: validPunchIn,
        taskId: validTaskId1,
        userId: validUserId1,
      });
      expect(res.status).toBe(201);
      expect(res.body.id).not.toBe(undefined);
      expect(res.body.message).toBe("Punched in successfully.");
    });
    it("sends the expected error message when the punchIn input is invalid", async () => {
      const res = await postPunchIn({
        punchIn: invalidPunchIn,
        taskId: validTaskId1,
        userId: validUserId1,
      });
      expect(res.status).toBe(400);
      expect(res.body.id).toBe(undefined);
      expect(res.body.message).toBe(
        'Punch validation failed: punchIn: Cast to Number failed for value "NaN" (type number) at path "punchIn"'
      );
    });
    it("sends the expected error message when the taskId input is invalid", async () => {
      const res = await postPunchIn({
        punchIn: validPunchIn,
        taskId: invalidTaskId,
        userId: validUserId1,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Punch validation failed: taskId: Cast to ObjectId failed for value "' +
          invalidTaskId +
          '" (type string) at path "taskId"'
      );
    });
    it("sends the expected error message when the userId input is invalid", async () => {
      const res = await postPunchIn({
        punchIn: validPunchIn,
        taskId: validTaskId1,
        userId: invalidUserId,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Punch validation failed: userId: Cast to ObjectId failed for value "' +
          invalidUserId +
          '" (type string) at path "userId"'
      );
    });
  });
  describe("when it receives post requests at punch-out", () => {
    const postPunchOut = (payload) => postWithHeaders("punch-out", payload);
    it("sends the expected success message when all request inputs are valid", async () => {
      const res = await postPunchOut({
        id: existingPunches[0]._id.toString(),
        punchOut: validPunchOut,
      });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Punched out successfully.");
    });
    it("sends the expected error message when id is invalid", async () => {
      const res = await postPunchOut({
        id: invalidPunchId,
        punchOut: validPunchOut,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Cast to ObjectId failed for value "' +
          invalidPunchId +
          '" (type string) at path "_id" for model "Punch"'
      );
    });
    it("sends the expected error message when id is valid, but not in the database", async () => {
      const res = await postPunchOut({
        id: validPunchId,
        punchOut: validPunchOut,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('No punch with id: "' + validPunchId + '" found.');
    });
    it("sends the expected error message when punchOut is invalid", async () => {
      const res = await postPunchOut({
        id: existingPunches[0]._id.toString(),
        punchOut: invalidPunchOut,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Cast to Number failed for value "' + invalidPunchOut + '" (type string) at path "punchOut"'
      );
    });
  });
  describe("when it receives post requests at user-punchlist", () => {
    const postUserPunchlist = (payload) => postWithHeaders("user-punchlist", payload);
    it("sends the expected success message when all request inputs are valid", async () => {
      const res = await postUserPunchlist({ userId: validUserId1 });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Punchlist successfully fetched.");
    });
    it("sends the expected error message when the userID is invalid", async () => {
      const res = await postUserPunchlist({ userId: invalidUserId });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Cast to ObjectId failed for value "' +
          invalidUserId +
          '" (type string) at path "userId" for model "Punch"'
      );
    });
  });
  describe("when it receives post requests at update-punch", () => {
    const postUpdatePunch = (payload) => postWithHeaders("update-punch", payload);
    it("sends the expected success message when all request inputs are valid", async () => {
      const res = await postUpdatePunch({
        id: existingPunches[0]._id.toString(),
        punchIn: validPunchIn2,
        taskId: validTaskId2,
        punchOut: validPunchOut2,
      });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Punch updated successfully.");
    });
    it("sends the expected error message when the id is invalid", async () => {
      const res = await postUpdatePunch({
        id: invalidPunchId,
        punchIn: validPunchIn2,
        taskId: validTaskId2,
        punchOut: validPunchOut2,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Cast to ObjectId failed for value "' +
          invalidPunchId +
          '" (type string) at path "_id" for model "Punch"'
      );
    });
    it("sends the expected error message when id is valid, but not in the database", async () => {
      const res = await postUpdatePunch({
        id: validPunchId,
        punchIn: validPunchIn2,
        taskId: validTaskId2,
        punchOut: validPunchOut2,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('No punch with id: "' + validPunchId + '" found.');
    });
    it("sends the expected error message when punchIn is invalid", async () => {
      const res = await postUpdatePunch({
        id: validPunchId,
        punchIn: invalidPunchIn,
        taskId: validTaskId2,
        punchOut: validPunchOut2,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Cast to Number failed for value "NaN" (type number) at path "punchIn"'
      );
    });
    it("sends the expected error message when taskId is invalid", async () => {
      const res = await postUpdatePunch({
        id: validPunchId,
        punchIn: validPunchIn2,
        taskId: invalidTaskId,
        punchOut: validPunchOut2,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Cast to ObjectId failed for value "' + invalidTaskId + '" (type string) at path "taskId"'
      );
    });
    it("sends the expected error message when punchOut is invalid", async () => {
      const res = await postUpdatePunch({
        id: validPunchId,
        punchIn: validPunchIn2,
        taskId: validTaskId2,
        punchOut: invalidPunchOut,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Cast to Number failed for value "NaN" (type number) at path "punchOut"'
      );
    });
  });
  describe("when it receives post requests at delete-punch", () => {
    const postDeletePunch = (payload) => postWithHeaders("delete-punch", payload);
    it("sends the expected success message when all request inputs are valid", async () => {
      const res = await postDeletePunch({
        id: existingPunches[0]._id.toString(),
      });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Punch deleted successfully.");
    });
    it("sends the expected error message when the id is invalid", async () => {
      const res = await postDeletePunch({ id: invalidPunchId });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Cast to ObjectId failed for value "' +
          invalidPunchId +
          '" (type string) at path "_id" for model "Punch"'
      );
    });
    it("sends the expected error message when id is valid, but not in the database", async () => {
      const res = await postDeletePunch({ id: validPunchId });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('No punch with id: "' + validPunchId + '" found.');
    });
  });
  describe("when it receives post requests at delete-punches-by-user", () => {
    const postDeletePunchesByUser = (payload) => postWithHeaders("delete-punches-by-user", payload);
    it("sends the expected success message when all request inputs are valid", async () => {
      const res = await postDeletePunchesByUser({ userId: validUserId1 });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("3 punch(es) deleted successfully.");
    });
    it("sends the expected error message when the userId is invalid", async () => {
      const res = await postDeletePunchesByUser({
        userId: invalidUserId,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Cast to ObjectId failed for value "' +
          invalidUserId +
          '" (type string) at path "userId" for model "Punch"'
      );
    });
  });
  describe("when it receives post requests at delete-punches-by-task", () => {
    const postDeletePunchesByTask = (payload) => postWithHeaders("delete-punches-by-task", payload);
    it("sends the expected success message when all request inputs are valid", async () => {
      const res = await postDeletePunchesByTask({
        taskId: validTaskId1,
        userId: validUserId1,
      });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("2 punch(es) deleted successfully.");
    });
    it("sends the expected error message when the userId is invalid", async () => {
      const res = await postDeletePunchesByTask({
        taskId: validTaskId1,
        userId: invalidUserId,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Cast to ObjectId failed for value "' +
          invalidUserId +
          '" (type string) at path "userId" for model "Punch"'
      );
    });
    it("sends the expected error message when the taskId is invalid", async () => {
      const res = await postDeletePunchesByTask({
        taskId: invalidTaskId,
        userId: validUserId1,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Cast to ObjectId failed for value "' +
          invalidTaskId +
          '" (type string) at path "taskId" for model "Punch"'
      );
    });
  });
});
