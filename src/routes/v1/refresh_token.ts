import { logger } from "@/lib/winston";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import Token from "@/models/token";
import { generateAccessToken, verifyRefreshToken } from "@/lib/jwt";
import type { Request, Response } from "express";
import { Types } from "mongoose";

const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string;

  try {
    const tokenExists = await Token.exists({ token: refreshToken });

    if (!tokenExists) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Invalid refresh token",
      });
      return;
    }
    // verify refresh token
    const jwtPayload = verifyRefreshToken(refreshToken) as {
      userId: Types.ObjectId;
    };
    const accessToken = generateAccessToken(jwtPayload.userId);
    res.status(200).json({ accessToken });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Refresh token expired",
      });
      return;
    }
    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Invalid refresh token",
      });
      return;
    }

    res.status(500).json({
      code: "InternalServerError",
      message: "Something went wrong",
      error: error,
    });
    logger.error("Error in refreshToken", error);
  }
};

export default refreshToken;
