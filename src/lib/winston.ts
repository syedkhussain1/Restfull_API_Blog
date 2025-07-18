import winston from "winston";
import config from "@/config";

const { combine, timestamp, json, errors, align, colorize, printf } =
  winston.format;

const transports: winston.transport[] = [];

if (config.NODE_ENV === "production") {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD hh:mm:ss A" }),
        align(),
        printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = meta.length ? JSON.stringify(meta, null, 2) : "";

          return `${timestamp} [${level}] ${message} ${metaStr}`;
        })
      ),
    })
  );
}

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    timestamp({ format: "YYYY-MM-DD hh:mm:ss A" }),
    json(),
    errors({ stack: true })
  ),
  transports,
  silent: config.NODE_ENV === "test",
});

export { logger };
