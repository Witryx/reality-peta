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
  const result = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      result?.error ||
        (response.status === 413
          ? "Fotografie je příliš velká pro odeslání. Zmenšete ji a zkuste to znovu."
          : "Požadavek se nepodařilo dokončit."),
      response.status,
    );
  if (result === null)
    throw new ApiError("Server vrátil neplatnou odpověď. Zkuste to znovu.", response.status);
  return result as T;
}
