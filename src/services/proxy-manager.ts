// services/proxy-manager.ts

import { Server } from 'bun';

export class ProxyManager {
  private currentProxy: string | undefined;
  private server: Server | undefined;
  private port: number = 3000;

  constructor (initialProxyUrl?: string) {
    this.currentProxy = initialProxyUrl;
    this.setupProxyServer();
  }

  private setupProxyServer(): void {
    this.server = Bun.serve({
      port: this.port,
      async fetch(req) {
        const url = new URL(req.url);

        try {
          const response = await fetch(url.toString(), { method: req.method, headers: req.headers, body: req.body });

          return new Response(response.body, { status: response.status, headers: response.headers });
        } catch (error) {
          console.error('Proxy error:', error);
          return new Response('Proxy Error', { status: 500 });
        }
      },
      error(error) {
        console.error('Server error:', error);
        return new Response('Server Error', { status: 500 });
      }
    });

    console.log(`Proxy server running at http://localhost:${this.port}`);
  }

  getCurrentProxy(): string | undefined {
    return this.currentProxy || `http://localhost:${this.port}`;
  }

  async updateProxyUrl(newProxyUrl: string): Promise<void> {
    this.currentProxy = newProxyUrl;
  }

  async rotateProxy(): Promise<string | undefined> {
    return this.getCurrentProxy();
  }

  shutdown(): void {
    if (this.server) {
      this.server.stop();
    }
  }
}
