// src/services/cookie-manager.ts

import { file } from 'bun';
import type { StoredCookies } from '../types/types';

export class CookieManager {
  private readonly cookiesPath: string;
  private readonly cookieExpirationMs: number;

  constructor (cookiesPath: string, cookieExpirationHours: number) {
    this.cookiesPath = cookiesPath;
    this.cookieExpirationMs = cookieExpirationHours * 60 * 60 * 1000;
  }

  async loadCookies(): Promise<StoredCookies | null> {
    try {
      const cookieFile = file(this.cookiesPath);
      const cookieData = await cookieFile.text();
      return JSON.parse(cookieData);
    } catch {
      return null;
    }
  }

  async saveCookies(cookies: string[]): Promise<void> {
    const cookieData: StoredCookies = { cookies, timestamp: Date.now() };
    await Bun.write(this.cookiesPath, JSON.stringify(cookieData, null, 2));
  }

  areCookiesValid(stored: StoredCookies): boolean {
    return Date.now() - stored.timestamp < this.cookieExpirationMs;
  }
}
