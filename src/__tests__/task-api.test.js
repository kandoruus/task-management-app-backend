const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");
const request = require("supertest");
const app = require("task-api");
const Task = require("mongoose-models/Task");
require("dotenv").config();

const tasksToPreloadToDB = [
  {
    _id: new ObjectID("655e5b359862131b75591e61"),
    data: {
      name: "Mock Task 1",
      description: "mock task for api testing",
      status: "Not Started",
      priority: "Low",
    },
    __v: 0,
  },
  {
    _id: new ObjectID("655e5b359862131b75591e62"),
    data: {
      name: "Mock Task 2",
      description: "mock task for api testing",
      status: "Not Started",
      priority: "Low",
    },
    __v: 0,
  },
  {
    _id: new ObjectID("655e5b359862131b75591e63"),
    data: {
      name: "Mock Task 3",
      description: "mock task for api testing",
      status: "Not Started",
      priority: "Low",
    },
    __v: 0,
  },
];
const mockTaskData = {
  name: "Mock Task 4",
  description: "mock task for api testing",
  status: "Not Started",
  priority: "Low",
};

describe("Task Management API", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    await Task.deleteMany({});
  });
  beforeEach(async () => {
    for (let i = 0; i < tasksToPreloadToDB.length; i++) {
      await Task.create(tasksToPreloadToDB[i]);
    }
  });
  afterEach(async () => {
    await Task.deleteMany({});
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
  it("responds to post requests at /task-api/task with an appropriate message and task id", async () => {
    const res = await request(app)
      .post("/task-api/task")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({ data: JSON.stringify(mockTaskData) });
    expect(res.body.message).toBe(mockTaskData.name + " saved successfully!");
    expect(res.body.id).toBeTruthy();
  });
  it("responds to post requests at /task-api/updatetask with an appropriate message", async () => {
    const dataToUpdate = {
      ...mockTaskData,
      name: "Updated Name",
    };
    const idToUpdate = tasksToPreloadToDB[0]._id.toString();
    const res = await request(app)
      .post("/task-api/updatetask")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        _id: idToUpdate,
        data: JSON.stringify(dataToUpdate),
      });
    expect(res.body.message).toBe("Task " + idToUpdate + " updated successfully!");
  });
  it("responds to post requests at /task-api/updatemanytasks with an appropriate message object", async () => {
    const res = await request(app)
      .post("/task-api/updatemanytasks")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        tasklist: JSON.stringify(
          tasksToPreloadToDB.map((task) => {
            return {
              ...task,
              _id: task._id.toString(),
              data: { ...task.data, name: "Updated Name" },
            };
          })
        ),
      });
    expect(res.body.ok).toBe(1);
    expect(res.body.nMatched).toBe(3);
    expect(res.body.nModified).toBe(3);
  });
  it("responds to post requests at /task-api/removetask/:id with an appropriate message", async () => {
    const idToRemove = tasksToPreloadToDB[0]._id.toString();
    const res = await request(app)
      .post("/task-api/removetask/" + idToRemove)
      .set("Content-Type", "application/x-www-form-urlencoded");
    const res2 = await request(app)
      .post("/task-api/removetask/" + idToRemove)
      .set("Content-Type", "application/x-www-form-urlencoded");
    expect(res.body.message).toBe(idToRemove + " deleted successfully!");
    expect(res2.body.message).toBe(idToRemove + " was not found.");
  });
  it("responds to post requests at /task-api/task/:id with an appropriate message or task object", async () => {
    const idToGet = tasksToPreloadToDB[0]._id.toString();
    const invalidIdToGet = "655e5b359862131b75591e64";
    const expectedRes = { ...tasksToPreloadToDB[0], _id: idToGet };
    const res = await request(app)
      .post("/task-api/task/" + idToGet)
      .set("Content-Type", "application/x-www-form-urlencoded");
    const res2 = await request(app)
      .post("/task-api/task/" + invalidIdToGet)
      .set("Content-Type", "application/x-www-form-urlencoded");
    expect(res.body).toEqual(expectedRes);
    expect(res2.body.message).toBe("No task found match id: '" + invalidIdToGet + "'");
  });
  it("responds to post requests at /task-api/tasklist with an array of all tasks in the db", async () => {
    const expectedRes = tasksToPreloadToDB.map((task) => {
      return {
        data: { ...task.data },
        _id: task._id.toString(),
        __v: task.__v,
      };
    });
    const res = await request(app)
      .post("/task-api/tasklist")
      .set("Content-Type", "application/x-www-form-urlencoded");
    expect(res.body).toEqual(expectedRes);
  });
  it("responds to get requests at /task-api/cleartasks with an appropriate message", async () => {
    const res = await request(app)
      .post("/task-api/cleartasks")
      .set("Content-Type", "application/x-www-form-urlencoded");
    expect(res.body.message).toEqual(tasksToPreloadToDB.length + " task(s) removed.");
    expect(await Task.find({})).toEqual([]);
  });
});
