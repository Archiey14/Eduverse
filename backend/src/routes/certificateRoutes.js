import { Router } from "express";
import { verifyCertificate } from "../controllers/certificateController.js";

const router = Router();

router.get("/:code", verifyCertificate);

export default router;
