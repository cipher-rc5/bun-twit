// twitter-client.ts

import { Scraper } from 'agent-twitter-client';
import { file } from 'bun';
import { CookieManager } from './services/cookie-manager';
import { ProxyManager } from './services/proxy-manager';
import { TweetConfigLoader } from './services/tweet-config-loader';
import { type ScheduleOptions } from './types/types';
import { getMimeType } from './utils/mime-types';

// Define interface for scraper options since it's not exported
interface ScraperInit {
  proxyUrl?: string;
}

class Logger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data ? data : '');
  }

  static error(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error ? error : '');
  }

  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data ? data : '');
  }

  static success(message: string) {
    console.log(`[SUCCESS] ${new Date().toISOString()} - ✓ ${message}`);
  }
}

export class TwitterClient {
  private scraper: Scraper;
  private cookieManager: CookieManager;
  private proxyManager: ProxyManager;
  private readonly MIN_DELAY_MINUTES = 2;

  constructor (cookiesPath = './twitter_cookies.json', cookieExpirationHours = 24, proxyUrl?: string) {
    this.proxyManager = new ProxyManager(proxyUrl);

    // Initialize scraper with proxy settings if available
    const scraperInit: ScraperInit = {};
    if (proxyUrl) {
      scraperInit.proxyUrl = proxyUrl;
    }

    this.scraper = new Scraper();
    this.cookieManager = new CookieManager(cookiesPath, cookieExpirationHours);
  }

  async login(): Promise<void> {
    try {
      Logger.info('Initiating authentication process');
      const storedCookies = await this.cookieManager.loadCookies();

      if (storedCookies && this.cookieManager.areCookiesValid(storedCookies)) {
        Logger.info('Found stored cookies', { timestamp: new Date(storedCookies.timestamp).toLocaleString() });

        try {
          await this.scraper.setCookies(storedCookies.cookies);
          Logger.success('Authentication successful using stored cookies');
          return;
        } catch (error) {
          Logger.warn('Stored cookies are invalid or expired');
          Logger.info('Attempting credential-based authentication');
        }
      }

      await this.scraper.login(Bun.env.TWITTER_USERNAME!, Bun.env.TWITTER_PASSWORD!, Bun.env.TWITTER_EMAIL!);

      const newCookies = await this.scraper.getCookies();
      await this.cookieManager.saveCookies(newCookies);
      Logger.success('Authentication successful using credentials');
    } catch (error) {
      Logger.error('Authentication failed', error);
      throw error;
    }
  }

  async sendTweet(content: string, mediaPaths: string[] = []): Promise<void> {
    try {
      Logger.info('Preparing to send tweet', {
        contentLength: content.length,
        hasMedia: mediaPaths.length > 0,
        mediaCount: mediaPaths.length
      });

      if (mediaPaths.length > 0) {
        Logger.info('Processing media files', { paths: mediaPaths });
        const mediaData = await Promise.all(
          mediaPaths.map(async (path): Promise<{ data: Buffer, mediaType: string }> => {
            const extension = path.split('.').pop()?.toLowerCase();
            const mimeType = getMimeType(extension);

            if (!mimeType) {
              Logger.error(`Unsupported media type`, { path, extension });
              throw new Error(`Unsupported media type for file: ${path}`);
            }

            Logger.info(`Processing media file`, { path, mimeType });
            const f = file(path);
            const data = Buffer.from(await f.arrayBuffer());
            return { data, mediaType: mimeType };
          })
        );

        await this.scraper.sendTweet(content, undefined, mediaData);
      } else {
        await this.scraper.sendTweet(content);
      }

      Logger.success('Tweet posted successfully');
    } catch (error) {
      Logger.error('Failed to send tweet', error);
      throw error;
    }
  }

  async sendConfiguredTweets(configPath: string, options: ScheduleOptions): Promise<void> {
    try {
      Logger.info('Loading tweet configuration', { configPath, options });
      const tweets = await TweetConfigLoader.loadTweetsConfig(configPath);
      const delayMinutes = Math.max(options.delayMinutes, this.MIN_DELAY_MINUTES);
      const delayMs = delayMinutes * 60 * 1000;

      if (options.proxyUrl) {
        Logger.info('Updating proxy configuration', { proxyUrl: options.proxyUrl });
        this.proxyManager.updateProxyUrl(options.proxyUrl);
      }

      const tweetsToSend = options.tweetCount > 0 ? tweets.slice(0, options.tweetCount) : tweets;
      Logger.info('Preparing tweet schedule', { totalTweets: tweetsToSend.length, delayMinutes });

      for (let i = 0;i < tweetsToSend.length;i++) {
        const tweet = tweetsToSend[i];
        const nextTweetTime = new Date(Date.now() + (i === 0 ? 0 : delayMs));

        Logger.info(`Processing tweet ${i + 1}/${tweetsToSend.length}`, {
          scheduledTime: nextTweetTime.toLocaleTimeString(),
          content: tweet.content,
          mediaCount: tweet.mediaPaths?.length || 0
        });

        if (i > 0) {
          Logger.info(`Waiting ${delayMinutes} minutes before next tweet`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        await this.sendTweet(tweet.content, tweet.mediaPaths || []);
      }

      Logger.success('All configured tweets have been sent successfully');
    } catch (error) {
      Logger.error('Failed to send configured tweets', error);
      throw error;
    }
  }

  cleanup(): void {
    this.proxyManager.shutdown();
  }
}
