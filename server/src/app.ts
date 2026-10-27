import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { healthRouter } from "./routes/health.js";
import { taskRouter } from "./routes/tasks.js";
import { weatherRouter } from "./routes/weather.js";

export function createApp() {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    }),
  );

  app.use("/api/health", healthRouter);
  app.use("/api/tasks", taskRouter);
  app.use("/api/weather", weatherRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
