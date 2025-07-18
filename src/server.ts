import express from "express";
import config from "@/config";
import limiter from "@/lib/express_rate_limit";
import cors from "cors";

import helmet from "helmet";
import type { CorsOptions } from "cors";
//Custom
import cookieParser from "cookie-parser";
import compression from "compression";
import v1Routes from "@/routes/v1";
import { connectDB, disconnectDB } from "@/lib/mongoose";
import { logger } from "@/lib/winston";

const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (config.NODE_ENV === "development" || !origin) {
      callback(null, true);
    } else {
      callback(new Error("CORS Error"));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  compression({
    threshold: 1024,
  })
);
app.use(helmet());
app.use(limiter);

(async () => {
  try {
    await connectDB();
    app.use("/api/v1", v1Routes);

    app.listen(config.PORT, () => {
      // logger.info(`Server is running on port ${config.PORT}`);
    });
  } catch (error) {
    // logger.warn("Error starting server", error);
  }
})();

const handleServerShutdown = async () => {
  try {
    await disconnectDB();
    // logger.info("Server is SHUTTING DOWN");
    process.exit(0);
  } catch (error) {
    // logger.warn("Error shutting down server", error);
  }
};

process.on("SIGTERM", handleServerShutdown);
process.on("SIGINT", handleServerShutdown);
