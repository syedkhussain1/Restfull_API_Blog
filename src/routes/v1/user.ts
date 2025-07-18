import { Router } from "express";
import { param, query, body } from "express-validator";
import authenticate from "@/middlewares/authenticate";
import validationError from "@/middlewares/validationError";
import authorize from "@/middlewares/authorize";
import getCurrentUser from "@/controllers/v1/user/get_current_user";
import updateCurrentUser from "@/controllers/v1/user/update_current_user";
import User from "@/models/user";
import deleteCurrentUser from "@/controllers/v1/user/delete_current_user";
import getAllUser from "@/controllers/v1/user/get_all_users";
import getUser from "@/controllers/v1/user/get_user";
import deleteUser from "@/controllers/v1/user/delete_user";

const router = Router();

router.get(
  "/current",
  authenticate,
  authorize(["user", "admin", "ninja"]),
  getCurrentUser
);

router.put(
  "/current",
  authenticate,
  authorize(["user", "admin", "ninja"]),
  body("username")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Username must be less than 20 characters")
    .custom(async (value) => {
      const userExists = await User.exists({ username: value });

      if (userExists) {
        throw Error("This username is already in use");
      }
    }),
  body("email")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Email must be less than 50 characters")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });

      if (userExists) {
        throw Error("This email is already in use");
      }
    }),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("firstName")
    .optional()
    .isLength({ max: 20 })
    .withMessage("First name must be less than 20 characters"),
  body("lastName")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Last name must be less than 20 characters"),
  body(["website", "linkedin", "x"])
    .optional()
    .isURL()
    .withMessage("Invalid URL")
    .isLength({ max: 100 })
    .withMessage("Url must be less than 100 characters"),
  validationError,
  updateCurrentUser
);

router.delete(
  "/current",
  authenticate,
  authorize(["admin", "user", "ninja"]),
  deleteCurrentUser
);

router.get(
  "/",
  authenticate,
  authorize(["admin", "ninja"]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 to 50"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a positive integer"),
  validationError,
  getAllUser
);

router.get(
  "/:userId",
  authenticate,
  authorize(["admin"]),
  param("userId").notEmpty().isMongoId().withMessage("Invalid user ID"),
  validationError,
  getUser
);

router.delete(
  "/:userId",
  authenticate,
  authorize(["admin", "ninja"]),
  param("userId").notEmpty().isMongoId().withMessage("Invalid user ID"),
  validationError,
  deleteUser
);

export default router;
