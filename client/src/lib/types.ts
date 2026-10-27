export type Task = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WeatherReport = {
  city: string;
  region: string | null;
  country: string | null;
  temperature: number;
  unit: "°C";
  weatherCode: number;
  condition: string;
};

export type TaskFilter = "all" | "active" | "completed";

export type TaskDraft = {
  title: string;
  description: string | null;
};
