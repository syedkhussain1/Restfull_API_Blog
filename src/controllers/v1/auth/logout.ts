import { logger } from "@/lib/winston";
import Token from "@/models/token";
import type { Request, Response } from "express";
import config from "@/config";

const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken as string;
    if (refreshToken) {
      await Token.deleteOne({ token: refreshToken });
      // TBD: logger
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: error,
    });
  }
};

export default logout;
