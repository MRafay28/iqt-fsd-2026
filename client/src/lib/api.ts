export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => null)) as
    | { data: T }
    | { error?: { message?: string } }
    | null;

  if (!response.ok) {
    const message =
      payload && "error" in payload ? payload.error?.message ?? "Request failed" : "Request failed";
    throw new ApiError(message);
  }

  if (!payload || !("data" in payload)) {
    throw new ApiError("Unexpected response from the server");
  }

  return payload.data;
}
