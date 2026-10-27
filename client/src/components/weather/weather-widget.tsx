"use client";

import { CloudSun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { WeatherReport } from "@/lib/types";

export function WeatherWidget() {
  const [city, setCity] = useState("London");
  const [weather, setWeather] = useState<WeatherReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  async function load(nextCity: string) {
    const trimmed = nextCity.trim();
    if (!trimmed) {
      setWeather(null);
      setError("Enter a city");
      return;
    }

    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      const report = await api<WeatherReport>(`/api/weather?city=${encodeURIComponent(trimmed)}`);
      if (id !== requestId.current) {
        return;
      }
      setWeather(report);
    } catch (loadError) {
      if (id !== requestId.current) {
        return;
      }
      setWeather(null);
      setError(loadError instanceof Error ? loadError.message : "Could not load weather");
    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    let cancelled = false;
    const id = ++requestId.current;

    api<WeatherReport>(`/api/weather?city=${encodeURIComponent("London")}`)
      .then((report) => {
        if (!cancelled && id === requestId.current) {
          setWeather(report);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled && id === requestId.current) {
          setWeather(null);
          setError(loadError instanceof Error ? loadError.message : "Could not load weather");
        }
      })
      .finally(() => {
        if (!cancelled && id === requestId.current) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const place = weather
    ? [weather.city, weather.region, weather.country].filter((part) => part && part.length > 0).join(", ")
    : null;

  return (
    <section className="w-full rounded-xl border bg-card p-3 shadow-sm sm:w-72" aria-label="Weather">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void load(city);
        }}
      >
        <Input
          aria-label="City"
          value={city}
          maxLength={100}
          onChange={(event) => setCity(event.target.value)}
          placeholder="City"
        />
        <Button type="submit" variant="outline" disabled={loading}>
          {loading ? "..." : "Check"}
        </Button>
      </form>
      <div className="mt-3 flex items-start gap-2 text-sm">
        <CloudSun className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="min-w-0">
          {loading && !weather ? <p className="text-muted-foreground">Checking conditions...</p> : null}
          {weather ? (
            <>
              <p className="font-medium">
                {weather.temperature}
                {weather.unit} · {weather.condition}
              </p>
              <p className="truncate text-muted-foreground">{place}</p>
            </>
          ) : null}
          {error ? <p className="text-destructive">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
