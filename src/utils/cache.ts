// High-Performance In-Memory Cache
class MemoryCache {
  private cache: Map<string, any> = new Map();
  private expiry: Map<string, number> = new Map();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 1000, defaultTTL = 300000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: any, ttl?: number): void {
    // Clean expired entries if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const expiryTime = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, value);
    this.expiry.set(key, expiryTime);
  }

  get(key: string): any {
    const expiryTime = this.expiry.get(key);
    
    // Check if expired
    if (!expiryTime || Date.now() > expiryTime) {
      this.cache.delete(key);
      this.expiry.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    this.expiry.delete(key);
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.expiry.clear();
  }

  // Clean expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, expiryTime] of this.expiry.entries()) {
      if (now > expiryTime) {
        this.cache.delete(key);
        this.expiry.delete(key);
      }
    }
  }

  // Get cache stats
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Create cache instances
export const airlinesCache = new MemoryCache(500, 600000); // 10 minutes for airlines
export const airportsCache = new MemoryCache(1000, 1800000); // 30 minutes for airports
export const searchCache = new MemoryCache(200, 300000); // 5 minutes for search results

// Cache key generators
export const generateCacheKey = {
  airlines: (query: any): string => {
    const { search, icao, iata, country, us_only, limit, cursor } = query;
    return `airlines:${JSON.stringify({ search, icao, iata, country, us_only, limit, cursor })}`;
  },
  
  airports: (query: any): string => {
    const { search, code, type, country, us_only, limit, cursor } = query;
    return `airports:${JSON.stringify({ search, code, type, country, us_only, limit, cursor })}`;
  },
  
  airportByCode: (code: string): string => {
    return `airport:${code.toUpperCase()}`;
  },
  
  popularAirlines: (): string => {
    return 'popular:airlines:us';
  },
  
  popularAirports: (): string => {
    return 'popular:airports:us';
  }
};

export default {
  airlinesCache,
  airportsCache, 
  searchCache,
  generateCacheKey,
};