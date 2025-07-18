import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { verifyAccessToken } from "@/lib/jwt";
import { logger } from "@/lib/winston";

import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";

// Extend Request interface for this file
declare global {
  namespace Express {
    interface Request {
      userId?: Types.ObjectId;
    }
  }
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // If there's no Bearer token, respond with 401 Unauthorized
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      code: "AuthenticationError",
      message: "Access denied, no token provided",
    });
    return;
  }

  // Split out the token from the 'Bearer' prefix
  const [_, token] = authHeader.split(" ");

  try {
    console.log("Token received:", token);

    // Verify the token and extract the userId from the payload
    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId };
    console.log("JWT payload:", jwtPayload);

    // Attach the userId to the request object for later use
    req.userId = jwtPayload.userId;
    console.log("UserId attached:", req.userId);

    // Proceed to the next middleware or route handler
    return next();
  } catch (err) {
    console.log("Authentication error:", err);

    // Handle expired token error
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Access token expired, request a new one with refresh token",
      });
      return;
    }

    // Handle invalid token error
    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Access token invalid",
      });
      return;
    }

    // Catch-all for other errors
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    logger.error("Error during authentication", err);
  }
};

export default authenticate;
