interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class SimpleCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private pending = new Map<string, Promise<unknown>>();

  async getOrSet<T>(key: string, loader: () => Promise<T>, ttl = 10_000): Promise<T> {
    const now = Date.now();
    const cached = this.store.get(key) as CacheEntry<T> | undefined;

    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>;
    }

    const promise = loader()
      .then((value) => {
        this.store.set(key, { value, expiresAt: Date.now() + ttl });
        this.pending.delete(key);
        return value;
      })
      .catch((error) => {
        this.pending.delete(key);
        throw error;
      });

    this.pending.set(key, promise);
    return promise;
  }

  set<T>(key: string, value: T, ttl = 10_000) {
    this.store.set(key, { value, expiresAt: Date.now() + ttl });
  }

  invalidate(key: string) {
    this.store.delete(key);
    this.pending.delete(key);
  }

  clear() {
    this.store.clear();
    this.pending.clear();
  }
}
