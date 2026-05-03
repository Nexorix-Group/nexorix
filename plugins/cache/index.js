/**
 * Cache Plugin — In-memory cache with TTL support
 * Copy to your project: src/core/plugins/cache/index.js
 * Or run: nexorix add cache
 */

const store = new Map();
const ttlStore = new Map();

export const cache = {
  /**
   * Set a value with optional TTL (seconds)
   * @param {string} key
   * @param {*} value
   * @param {number} ttlSeconds - 0 = no expiry
   */
  set(key, value, ttlSeconds = 300) {
    store.set(key, value);
    if (ttlSeconds > 0) {
      const existing = ttlStore.get(key);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        store.delete(key);
        ttlStore.delete(key);
      }, ttlSeconds * 1000);
      ttlStore.set(key, timer);
    }
  },

  get(key) {
    return store.get(key) ?? null;
  },

  has(key) {
    return store.has(key);
  },

  delete(key) {
    const timer = ttlStore.get(key);
    if (timer) clearTimeout(timer);
    store.delete(key);
    ttlStore.delete(key);
  },

  clear() {
    for (const timer of ttlStore.values()) clearTimeout(timer);
    store.clear();
    ttlStore.clear();
  },

  size() {
    return store.size;
  },

  stats() {
    return {
      size: store.size,
      keys: [...store.keys()],
    };
  },

  /**
   * Get or set pattern — fetch from cache or compute and store
   */
  async getOrSet(key, fn, ttlSeconds = 300) {
    if (this.has(key)) return this.get(key);
    const value = await fn();
    this.set(key, value, ttlSeconds);
    return value;
  },
};
