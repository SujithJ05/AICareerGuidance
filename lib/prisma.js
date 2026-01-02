import { PrismaClient } from "./generated/prisma";
import { logger } from "./logger";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "minimal",
  });
};

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

db.$connect().catch((error) => {
  logger.error("Failed to connect to database:", error);
  process.exit(1);
});
