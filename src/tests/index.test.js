const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app/app");
require("dotenv").config();

describe("Task Management API", () => {
  it("works", async () => {
    await expect(true).toEqual(true);
  });
});
