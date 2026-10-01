const BASE_URL = (
  import.meta.env.VITE_API_URL ?? ""
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message,
    {
      status = 0,
      data = null,
      network = false,
    } = {},
  ) {
    super(message);

    this.name = "ApiError";

    this.status = status;

    this.data = data;

    this.network = network;
  }
}

/*
|--------------------------------------------------------------------------
| API URL
|--------------------------------------------------------------------------
|
| Production:
|
| If VITE_API_URL is empty:
|
|   /api/...
|
| This is important for Vercel because the
| frontend and API are deployed together.
|
| Local development:
|
|   VITE_API_URL=http://localhost:5000
|
|--------------------------------------------------------------------------
*/

export function getApiBaseUrl() {
  return BASE_URL;
}

export async function request(
  path,
  {
    method = "GET",
    body,
    signal,
  } = {},
) {
  const url =
    `${BASE_URL}${path}`;

  let response;

  try {
    response =
      await fetch(url, {
        method,

        signal,

        /*
         * Required for admin authentication
         * because the admin session uses a cookie.
         */
        credentials: "include",

        headers:
          body === undefined
            ? undefined
            : {
                "Content-Type":
                  "application/json",
              },

        body:
          body === undefined
            ? undefined
            : JSON.stringify(
                body,
              ),
      });
  } catch (error) {
    if (
      error?.name ===
      "AbortError"
    ) {
      throw error;
    }

    throw new ApiError(
      "Could not reach the server. Please check your connection and try again.",
      {
        network: true,
      },
    );
  }

  const text =
    await response.text();

  let data = null;

  if (text) {
    try {
      data =
        JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message ||
        `Request failed (${response.status}).`,
      {
        status:
          response.status,

        data,
      },
    );
  }

  if (data === null) {
    throw new ApiError(
      "The server returned an invalid response.",
      {
        status:
          response.status,
      },
    );
  }

  return data;
}