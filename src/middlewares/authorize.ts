import User from "@/models/user";
import type { Request, Response, NextFunction } from "express";

type AuthRole = "admin" | "user" | "ninja";

const authorize = (roles: AuthRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("Authorize middleware - userId:", req.userId);
    console.log("Authorize middleware - required roles:", roles);

    const userId = req.userId;

    try {
      console.log("Looking up user with ID:", userId);
      const user = await User.findById(userId).select("role").exec();
      console.log("Found user:", user);

      if (!user) {
        res.status(401).json({
          code: "NotFound",
          message: "User not found",
        });
        return;
      }
      if (!roles.includes(user.role)) {
        res.status(403).json({
          code: "AuthorizationError",
          message: "Access denied, insufficient permissions",
        });
        return;
      }

      // User is authorized, proceed to next middleware
      return next();
    } catch (error) {
      res.status(500).json({
        code: "ServerError",
        message: "Internal server error",
        error: error,
      });
      return;
    }
  };
};

export default authorize;
