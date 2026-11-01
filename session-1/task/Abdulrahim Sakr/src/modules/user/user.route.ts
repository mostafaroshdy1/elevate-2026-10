import { Router } from "express";
import { userController } from "./user.controller.js";
import { asyncHandler } from "../../shared/utils/error/async.handler.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
} from "./user.validators.js";

/**
 * User routes.
 *
 * Route → Middleware → Controller → Service → Model
 *
 * Each route declares its middleware chain explicitly:
 * 1. authenticate — verifies JWT
 * 2. authorize() — checks user role
 * 3. validate() — validates request data
 * 4. asyncHandler() — catches async errors
 */

const router = Router();

router.get(
  "/",
  authenticate,
  asyncHandler(userController.getAll.bind(userController)),
);

router.get(
  "/:id",
  authenticate,
  validate({ params: idParamSchema }),
  asyncHandler(userController.getById.bind(userController)),
);

router.post(
  "/",
  authenticate,
  authorize("admin", "superadmin"),
  validate({ body: createUserSchema }),
  asyncHandler(userController.create.bind(userController)),
);

router.patch(
  "/:id",
  authenticate,
  validate({ params: idParamSchema, body: updateUserSchema }),
  asyncHandler(userController.update.bind(userController)),
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "superadmin"),
  validate({ params: idParamSchema }),
  asyncHandler(userController.delete.bind(userController)),
);

export default router;
