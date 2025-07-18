import { logger } from "@/lib/winston";
import config from "@/config";
import type { Request, Response } from "express";
import User from "@/models/user";
import type { IUser } from "@/models/user";
import { generateUsername } from "@/utils";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import Token from "@/models/token";

type UserData = Pick<IUser, "email" | "password">;

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as UserData;

    const user = await User.findOne({ email })
      .select("username email password role")
      .lean()
      .exec();

    if (!user) {
      res.status(404).json({
        code: "NotFound",
        message: "User not found",
      });
      return;
    }

    // Generate access token and refresh token
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in DB
    await Token.create({
      token: refreshToken,
      userId: user._id,
    });
    logger.info("Refresh token stored in DB", {
      userId: user._id,
      token: refreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Json response
    res.status(201).json({
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
    logger.info("User registered", user);
  } catch (error) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: error,
    });
  }
};

export default login;
