import express from "express";

import {
  loginAdmin,
  checkAdmin,
  logoutAdmin,
  listRegistrations,
  changeRegistrationStatus,
} from "../controllers/adminController.js";

import { requireAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

/*
  Authentication
*/

router.post("/login", loginAdmin);

router.get("/check", checkAdmin);

router.post("/logout", logoutAdmin);

/*
  Protected admin routes
*/

router.get(
  "/registrations",
  requireAdmin,
  listRegistrations,
);

router.put(
  "/registrations/:rowNumber/status",
  requireAdmin,
  changeRegistrationStatus,
);

export default router;