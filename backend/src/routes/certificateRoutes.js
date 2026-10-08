import { Router } from "express";
import { verifyCertificate, downloadCertificatePdf } from "../controllers/certificateController.js";

const router = Router();

router.get("/:code", verifyCertificate);
router.get("/:code/download", downloadCertificatePdf);

export default router;
