import express from "express";

import {
  loginAdmin,
  checkAdmin,
  logoutAdmin,
  listRegistrations,
  changeRegistrationStatus,
  getAvailableAdminEvents,
} from "../controllers/adminController.js";

import {
  requireAdmin,
} from "../middleware/adminAuth.js";

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| Event list
|--------------------------------------------------------------------------
*/

router.get(
  "/events",
  getAvailableAdminEvents,
);

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

router.post(
  "/login",
  loginAdmin,
);

/*
|--------------------------------------------------------------------------
| Session
|--------------------------------------------------------------------------
*/

router.get(
  "/check",
  checkAdmin,
);

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

router.post(
  "/logout",
  logoutAdmin,
);

/*
|--------------------------------------------------------------------------
| Registrations
|--------------------------------------------------------------------------
*/

router.get(
  "/registrations",
  requireAdmin,
  listRegistrations,
);

/*
|--------------------------------------------------------------------------
| Verify / Reject
|--------------------------------------------------------------------------
*/

router.put(
  "/registrations/:rowNumber/status",
  requireAdmin,
  changeRegistrationStatus,
);

export default router;
