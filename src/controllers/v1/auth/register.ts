import { logger } from "@/lib/winston";
import config from "@/config";
import { Request, Response } from "express";
import User from "@/models/user";
import { IUser } from "@/models/user";
import { generateUsername } from "@/utils";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import Token from "@/models/token";

type UserData = Pick<IUser, "email" | "password" | "role">;

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body as UserData;

  try {
    const username = generateUsername();

    const newUser = await User.create({
      username,
      email,
      password,
      role,
    });

    // Generate access token and refresh token
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // Store refresh token in DB
    await Token.create({
      token: refreshToken,
      userId: newUser._id,
    });
    logger.info("Refresh token stored in DB", {
      userId: newUser._id,
      token: refreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(201).json({
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken,
    });
    logger.info("User registered", {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: error,
    });
  }
};

export default register;
