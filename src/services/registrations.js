import {
  request,
} from "./api";

/*
|--------------------------------------------------------------------------
| Submit registration
|--------------------------------------------------------------------------
*/

export function submitRegistration(
  payload,
  { signal } = {},
) {
  return request(
    "/api/registrations",
    {
      method: "POST",
      body: payload,
      signal,
    },
  );
}