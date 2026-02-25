import { DevFlags } from "../DevConsole/configs/DevFlagsConfig";

export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {

  const headers = new Headers(options.headers || {});

  const store = DevFlags.isEnabled("useDevStorage")
    ? "dev"
    : "prod";

  headers.set("X-Storage-Env", store);
  console.log(store);

  return fetch(url, {
    ...options,
    headers,
  });
}