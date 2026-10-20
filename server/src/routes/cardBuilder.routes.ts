import { Router } from "express";

import {
  requireAdmin,
} from "../middleware/admin.middleware.ts";


import {
  getArchetypeRecommendationsController,
  getTeacherPersonalityController,
  saveTeacherPersonalityController,
} from "../controllers/archetype.controller.ts";


import {
  approveCardController,
  generateCardController,
  getCardBuilderController,
  getCardController,
  getCardHistoryController,
  rejectCardController,
} from "../controllers/card.controller.ts";


const router = Router();

router.use(requireAdmin);


// =====================================================
// ARCHETYPE / PERSONALITY
// =====================================================

router.get(
  "/teachers/:teacherId/recommendations",
  getArchetypeRecommendationsController
);


router.get(
  "/teachers/:teacherId/personality",
  getTeacherPersonalityController
);


router.put(
  "/teachers/:teacherId/personality",
  saveTeacherPersonalityController
);


// =====================================================
// CARD BUILDER
// =====================================================

router.get(
  "/teachers/:teacherId/builder",
  getCardBuilderController
);


router.post(
  "/teachers/:teacherId/generate",
  generateCardController
);


router.get(
  "/teachers/:teacherId/history",
  getCardHistoryController
);


// =====================================================
// INDIVIDUAL CARD
// =====================================================

router.get(
  "/:cardId",
  getCardController
);


router.patch(
  "/:cardId/approve",
  approveCardController
);


router.patch(
  "/:cardId/reject",
  rejectCardController
);


export default router;