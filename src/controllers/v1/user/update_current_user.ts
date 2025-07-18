import User from "@/models/user";
import type { Request, Response } from "express";

const updateCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.userId;
  const {
    username,
    email,
    password,
    firstName,
    lastName,
    website,
    linkedin,
    x,
  } = req.body;

  try {
    const user = await User.findById(userId).select("+password-__v").exec();
    if (!user) {
      res.status(404).json({
        code: "NotFound",
        message: "User not found",
      });
      return;
    }
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (website) user.socialLinks.website = website;
    if (linkedin) user.socialLinks.linkedin = linkedin;
    if (x) user.socialLinks.x = x;

    await user.save();

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    // logger.error("Error while updating current user", err);
  }
};

export default updateCurrentUser;
