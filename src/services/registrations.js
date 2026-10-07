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

export function fetchPublicRegistrationCount(eventId, { signal } = {}) {
  return request(`/api/registrations/counts/${encodeURIComponent(eventId)}`, { signal });
}
