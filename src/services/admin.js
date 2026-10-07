import {
  request,
} from "./api";

export const fetchAdminEvents = ({
  signal,
} = {}) =>
  request(
    "/api/admin/events",
    {
      signal,
    },
  ).then(
    (data) =>
      data.events ?? [],
  );

export const loginAdmin = (
  username,
  password,
  eventId,
) =>
  request(
    "/api/admin/login",
    {
      method:
        "POST",

      body: {
        username,
        password,
        eventId,
      },
    },
  );

export const checkAdmin = ({
  signal,
} = {}) =>
  request(
    "/api/admin/check",
    {
      signal,
    },
  );

export const logoutAdmin =
  () =>
    request(
      "/api/admin/logout",
      {
        method:
          "POST",
      },
    );

export const fetchRegistrations = ({
  signal,
} = {}) =>
  request(
    "/api/admin/registrations",
    {
      signal,
    },
  );

export const updateRegistrationStatus = (
  rowNumber,
  status,
) =>
  request(
    `/api/admin/registrations/${encodeURIComponent(
      rowNumber,
    )}/status`,
    {
      method:
        "PUT",

      /*
       * DO NOT send eventId.
       *
       * Backend takes eventId from
       * the signed admin session.
       */
      body: {
        status,
      },
    },
  );
