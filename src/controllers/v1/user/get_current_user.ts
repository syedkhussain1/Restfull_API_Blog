import User from "@/models/user";
import type { Request, Response } from "express";

const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  console.log("getCurrentUser controller - userId:", req.userId);

  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("-__v").lean().exec();
    console.log("Found user in controller:", user);

    res.status(200).json({
      user,
    });
    console.log("Response sent");
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    // logger.error("Error while getting current user", err);
  }
};

export default getCurrentUser;
