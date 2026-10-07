
import express from "express";

import {
  createRegistration,
  getPublicRegistrationCount,
} from "../controllers/registrationController.js";

const router = express.Router();

// POST /api/registrations
// POST /api/registrations/
//
// Also works under /registrations and /registrations/.
//
// The controller and all existing validation,
// email, and Google Sheets logic remain unchanged.

router.post("/", createRegistration);
router.get("/counts/:eventId", getPublicRegistrationCount);

export default router;

