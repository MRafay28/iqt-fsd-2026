import { HttpError } from "../lib/httpError.js";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const WEATHER_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

type GeocodingResponse = {
  results?: Array<{
    name: string;
    country?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }>;
};

type ForecastResponse = {
  current?: {
    temperature_2m: number;
    weather_code: number;
  };
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

async function fetchJson<T>(url: URL): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "iq-taskboard/1.0 (assessment)" },
    });
  } catch {
    throw new HttpError(502, "Weather service is unavailable");
  }

  if (!response.ok) {
    throw new HttpError(502, "Weather service is unavailable");
  }

  return (await response.json()) as T;
}

export function weatherLabel(code: number) {
  return WEATHER_LABELS[code] ?? "Unknown conditions";
}

export async function getWeather(city: string): Promise<WeatherReport> {
  const geocodingUrl = new URL(GEOCODING_URL);
  geocodingUrl.searchParams.set("name", city);
  geocodingUrl.searchParams.set("count", "1");
  geocodingUrl.searchParams.set("language", "en");
  geocodingUrl.searchParams.set("format", "json");

  const geocoding = await fetchJson<GeocodingResponse>(geocodingUrl);
  const place = geocoding.results?.[0];
  if (!place) {
    throw new HttpError(404, "City not found");
  }

  const forecastUrl = new URL(FORECAST_URL);
  forecastUrl.searchParams.set("latitude", String(place.latitude));
  forecastUrl.searchParams.set("longitude", String(place.longitude));
  forecastUrl.searchParams.set("current", "temperature_2m,weather_code");
  forecastUrl.searchParams.set("timezone", "auto");

  const forecast = await fetchJson<ForecastResponse>(forecastUrl);
  if (!forecast.current) {
    throw new HttpError(502, "Weather service did not return current conditions");
  }

  return {
    city: place.name,
    region: place.admin1 ?? null,
    country: place.country ?? null,
    temperature: forecast.current.temperature_2m,
    unit: "°C",
    weatherCode: forecast.current.weather_code,
    condition: weatherLabel(forecast.current.weather_code),
  };
}
