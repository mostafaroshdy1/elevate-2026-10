import { Router } from "express";
import { authController } from "./auth.controller.js";
import { asyncHandler } from "../../shared/utils/error/async.handler.js";
import { validate } from "../../middlewares/validate.js";
import { limitAuthRequests } from "../../middlewares/limit.auth.requests.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "./auth.validators.js";

const router = Router();

router.post(
  "/register",
  limitAuthRequests,
  validate({ body: registerSchema }),
  asyncHandler(authController.register.bind(authController)),
);

router.post(
  "/login",
  limitAuthRequests,
  validate({ body: loginSchema }),
  asyncHandler(authController.login.bind(authController)),
);

router.post(
  "/refresh-token",
  validate({ body: refreshTokenSchema }),
  asyncHandler(authController.refreshToken.bind(authController)),
);

export default router;
