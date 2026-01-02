import { NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function withRateLimit(req, handler, limit = 60) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rateLimitResult = apiLimiter.check(limit, ip);

  if (rateLimitResult.isRateLimited) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString(),
          "Retry-After": Math.ceil(
            (rateLimitResult.reset - Date.now()) / 1000
          ).toString(),
        },
      }
    );
  }

  const response = await handler(req);

  response.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString());
  response.headers.set(
    "X-RateLimit-Remaining",
    rateLimitResult.remaining.toString()
  );
  response.headers.set(
    "X-RateLimit-Reset",
    new Date(rateLimitResult.reset).toISOString()
  );

  return response;
}

export async function withErrorHandling(handler) {
  return async (req) => {
    try {
      return await handler(req);
    } catch (error) {
      logger.error("API Error:", error);

      if (error.status) {
        return NextResponse.json(
          { error: error.message || "An error occurred" },
          { status: error.status }
        );
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

export function composeMiddleware(...middlewares) {
  return async (req, finalHandler) => {
    let handler = finalHandler;

    for (let i = middlewares.length - 1; i >= 0; i--) {
      const middleware = middlewares[i];
      const nextHandler = handler;
      handler = async (req) => middleware(req, nextHandler);
    }

    return handler(req);
  };
}
