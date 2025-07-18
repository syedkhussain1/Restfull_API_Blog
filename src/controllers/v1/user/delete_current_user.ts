import { logger } from "@/lib/winston";
import User from "@/models/user";

/**
 * Types
 */
import type { Request, Response } from "express";

const deleteCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.userId;
  console.log("deleteCurrentUser controller - userId:", userId);

  try {
    await User.deleteOne({ _id: userId });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    logger.error("Error while deleting current user account", err);
  }
};

export default deleteCurrentUser;
