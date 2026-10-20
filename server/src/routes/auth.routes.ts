import { Router } from "express";

import {
  adminLogin,
  adminLogout,
} from "../controllers/auth.controller.ts";

import { requireAdmin } from "../middleware/admin.middleware.ts";

const router = Router();

router.post("/admin/login", adminLogin);

router.post(
  "/admin/logout",
  requireAdmin,
  adminLogout
);

router.get(
  "/admin/me",
  requireAdmin,
  (req, res) => {
    return res.status(200).json({
      success: true,
      authenticated: true,
      adminId: res.locals.adminId,
    });
  }
);

export default router;