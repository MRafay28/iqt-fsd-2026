import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { validateQuery } from "../middleware/validate.js";
import { getWeather } from "../services/weatherService.js";
import { weatherQuerySchema } from "../validators/task.js";

export const weatherRouter = Router();

weatherRouter.get(
  "/",
  validateQuery(weatherQuerySchema),
  asyncHandler(async (_req, res) => {
    const { city } = res.locals.query as { city: string };
    const weather = await getWeather(city);
    res.json({ data: weather });
  }),
);
