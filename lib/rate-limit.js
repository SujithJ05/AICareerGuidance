const rateLimitMap = new Map();

export function rateLimit({ interval = 60000, uniqueTokenPerInterval = 100 }) {
  return {
    check: (limit, token) => {
      const tokenCount = rateLimitMap.get(token) || [0];

      if (tokenCount[0] === 0) {
        rateLimitMap.set(token, [1]);
        setTimeout(() => {
          rateLimitMap.delete(token);
        }, interval);
      } else {
        tokenCount[0] += 1;
        rateLimitMap.set(token, tokenCount);
      }

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage > limit;

      return {
        isRateLimited,
        remaining: Math.max(0, limit - currentUsage),
        limit,
        reset: Date.now() + interval,
      };
    },
  };
}

export const apiLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export const strictLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 100,
});
