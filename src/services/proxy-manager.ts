// src/services/proxy-manager.ts

export class ProxyManager {
  private proxyUrl?: string;

  constructor (proxyUrl?: string) {
    this.proxyUrl = proxyUrl;
  }

  configureProxy(): string | undefined {
    return this.proxyUrl;
  }
}
