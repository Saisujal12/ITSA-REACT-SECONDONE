
import express from "express";
import { startAbstractUpload, uploadAbstractChunk } from '../controllers/abstractUploadController.js';

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
router.post('/abstract-uploads', startAbstractUpload);
router.post('/abstract-uploads/chunk', uploadAbstractChunk);
router.get("/counts/:eventId", getPublicRegistrationCount);

export default router;

