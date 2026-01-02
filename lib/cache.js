const cache = new Map();
const MAX_CACHE_SIZE = 100;
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const memoryCache = {
  get(key) {
    const item = cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }

    return item.value;
  },

  set(key, value, ttl = DEFAULT_TTL) {
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  },

  delete(key) {
    cache.delete(key);
  },

  clear() {
    cache.clear();
  },

  has(key) {
    const item = cache.get(key);
    if (!item) return false;
    if (Date.now() > item.expiry) {
      cache.delete(key);
      return false;
    }
    return true;
  },
};

export function memoize(fn, ttl = DEFAULT_TTL) {
  return async function (...args) {
    const key = JSON.stringify(args);

    if (memoryCache.has(key)) {
      return memoryCache.get(key);
    }

    const result = await fn(...args);
    memoryCache.set(key, result, ttl);
    return result;
  };
}
