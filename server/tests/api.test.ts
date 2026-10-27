import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

const app = createApp();

beforeEach(async () => {
  await prisma.task.deleteMany();
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.$disconnect();
});

describe("tasks", () => {
  it("creates a task and returns the list with the newest first", async () => {
    const first = await request(app)
      .post("/api/tasks")
      .send({ title: "Draft the API", description: "Express routes and validation" })
      .expect(201);

    const second = await request(app)
      .post("/api/tasks")
      .send({ title: "Build the UI" })
      .expect(201);

    expect(first.body.data.completed).toBe(false);
    expect(first.body.data.description).toBe("Express routes and validation");
    expect(second.body.data.description).toBeNull();

    const list = await request(app).get("/api/tasks").expect(200);
    expect(list.body.data).toHaveLength(2);
    expect(list.body.data.map((task: { title: string }) => task.title)).toEqual(
      expect.arrayContaining(["Build the UI", "Draft the API"]),
    );
    expect(new Date(list.body.data[0].createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(list.body.data[1].createdAt).getTime(),
    );
  });

  it("rejects an empty task", async () => {
    const response = await request(app).post("/api/tasks").send({ title: "   " }).expect(400);
    expect(response.body.error.message).toBe("Validation failed");
  });

  it("updates, completes, and deletes a task", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Review the schema", description: "First pass" })
      .expect(201);

    const id = created.body.data.id as string;

    const updated = await request(app)
      .patch(`/api/tasks/${id}`)
      .send({ title: "Review the schema again", description: null, completed: true })
      .expect(200);

    expect(updated.body.data.title).toBe("Review the schema again");
    expect(updated.body.data.description).toBeNull();
    expect(updated.body.data.completed).toBe(true);

    await request(app).delete(`/api/tasks/${id}`).expect(204);
    const list = await request(app).get("/api/tasks").expect(200);
    expect(list.body.data).toHaveLength(0);
  });

  it("returns 404 when a task does not exist", async () => {
    const missingId = "5f6b5c3e-3c2a-4f1b-9d2e-1a2b3c4d5e6f";
    await request(app).patch(`/api/tasks/${missingId}`).send({ completed: true }).expect(404);
    await request(app).delete(`/api/tasks/${missingId}`).expect(404);
  });

  it("rejects an id that is not a UUID", async () => {
    await request(app).patch("/api/tasks/not-a-uuid").send({ completed: true }).expect(400);
  });

  it("rejects an update with no fields", async () => {
    const created = await request(app).post("/api/tasks").send({ title: "Keep me" }).expect(201);
    await request(app).patch(`/api/tasks/${created.body.data.id}`).send({}).expect(400);
  });
});

describe("health", () => {
  it("reports that the database is up", async () => {
    const response = await request(app).get("/api/health").expect(200);
    expect(response.body.data.status).toBe("ok");
    expect(response.body.data.database).toBe("up");
  });
});

describe("weather", () => {
  it("requires a city", async () => {
    await request(app).get("/api/weather").expect(400);
  });

  it("returns current conditions for a known city", async () => {
    const response = await request(app).get("/api/weather").query({ city: "London" }).expect(200);
    expect(response.body.data.city).toBe("London");
    expect(typeof response.body.data.temperature).toBe("number");
    expect(response.body.data.condition).toEqual(expect.any(String));
  });

  it("returns 404 when the city cannot be found", async () => {
    await request(app).get("/api/weather").query({ city: "zzzznotacity12345" }).expect(404);
  });
});
