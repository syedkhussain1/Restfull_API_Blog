import mongoose from "mongoose";
import config from "@/config";
import type { ConnectOptions } from "mongoose";
import { logger } from "@/lib/winston";

const clientOptions: ConnectOptions = {
  dbName: "blog-db",
  appName: "blog API",
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

export const connectDB = async (): Promise<void> => {
  if (!config.MONGO_URL) {
    throw new Error("MONGO_URI is not defined - check .env file");
  }

  try {
    await mongoose.connect(config.MONGO_URL, clientOptions);
    logger.info("MongoDB connected", {
      uri: config.MONGO_URL,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`MongoDB connection error: ${error.message}`);
    }
    console.error("MongoDB connection error", error);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected", {
      uri: config.MONGO_URL,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`MongoDB disconnection error: ${error.message}`);
    }
    console.error("MongoDB disconnection error", error);
  }
};
