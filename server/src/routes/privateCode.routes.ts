import { Router } from "express";

import { requireAdmin } from "../middleware/admin.middleware.ts";

import {
  deleteCodeController,
  generateCodesController,
  listCodesController,
} from "../controllers/privateCode.controller.ts";

const router = Router();

router.use(requireAdmin);

router.post(
  "/generate",
  generateCodesController
);

router.get(
  "/",
  listCodesController
);

router.delete(
  "/:id",
  deleteCodeController
);

export default router;