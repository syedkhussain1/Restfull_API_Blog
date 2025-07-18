import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  firstName: string;
  lastName: string;
  socialLinks: {
    website?: string;
    x?: string;
    linkedin?: string;
  };
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      maxLength: [20, "Username must be less than 20 characters"],
      unique: [true, "Username must be unique"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      maxLength: [50, "Email must be less than 50 characters"],
      unique: [true, "Email must be unique"],
    },
    password: { type: String, required: [false, "Password is required"] },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["admin", "user", "Ninja"],
        message: "{VALUE} is not a valid role",
      },
    },
    firstName: {
      type: String,
      required: [false, "First name is required"],
      minLength: [1, "First name must be at least 2 characters"],
    },
    lastName: {
      type: String,
      required: [false, "Last name is required"],
      minLength: [1, "Last name must be at least 2 characters"],
    },
    socialLinks: {
      website: {
        type: String,
        maxLength: [100, "Website must be less than 100 characters"],
        required: false,
      },
      x: {
        type: String,
        maxLength: [100, "X must be less than 100 characters"],
        required: false,
      },
      linkedin: {
        type: String,
        maxLength: [100, "LinkedIn must be less than 100 characters"],
        required: false,
      },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }
  // Hash password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default model<IUser>("User", userSchema);
