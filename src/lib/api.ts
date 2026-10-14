export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      ...(typeof options?.body === "string" ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    },
  });
  const result = await response.json();
  if (!response.ok)
    throw new ApiError(result.error || "Požadavek se nepodařilo dokončit.", response.status);
  return result as T;
}
