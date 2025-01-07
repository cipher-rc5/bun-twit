// twitter-client.ts

import { Scraper } from 'agent-twitter-client';
import { file } from 'bun';
import { CookieManager } from './services/cookie-manager';
import { ProxyManager } from './services/proxy-manager';
import { TweetConfigLoader } from './services/tweet-config-loader';
import { type MediaData, type ScheduleOptions } from './types/types';
import { getMimeType } from './utils/mime-types';

export class TwitterClient {
  private scraper: Scraper;
  private cookieManager: CookieManager;
  private proxyManager: ProxyManager;
  private readonly MIN_DELAY_MINUTES = 2;

  constructor (cookiesPath = './twitter_cookies.json', cookieExpirationHours = 24, proxyUrl?: string) {
    this.scraper = new Scraper();
    this.cookieManager = new CookieManager(cookiesPath, cookieExpirationHours);
    this.proxyManager = new ProxyManager(proxyUrl);
  }

  async login(): Promise<void> {
    try {
      console.log('\nAttempting authentication...');
      const storedCookies = await this.cookieManager.loadCookies();

      if (storedCookies && this.cookieManager.areCookiesValid(storedCookies)) {
        console.log('Found valid stored cookies from:', new Date(storedCookies.timestamp).toLocaleString());
        try {
          // Remove unused proxyUrl variable
          await this.scraper.setCookies(storedCookies.cookies);
          console.log('✓ Successfully authenticated using stored cookies');
          return;
        } catch (error) {
          console.log('⚠ Stored cookies are invalid or expired');
          console.log('Falling back to credential-based authentication...');
        }
      }

      await this.scraper.login(Bun.env.TWITTER_USERNAME!, Bun.env.TWITTER_PASSWORD!, Bun.env.TWITTER_EMAIL!);

      const newCookies = await this.scraper.getCookies();
      await this.cookieManager.saveCookies(newCookies);
      console.log('✓ Successfully authenticated using credentials');
      console.log('New cookies have been stored for future use\n');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async sendTweet(content: string, mediaPaths: string[] = []): Promise<void> {
    try {
      let mediaData: MediaData[] | undefined;
      if (mediaPaths.length > 0) {
        mediaData = await Promise.all(mediaPaths.map(async (path): Promise<MediaData> => {
          const extension = path.split('.').pop()?.toLowerCase();
          const mimeType = getMimeType(extension);

          if (!mimeType) {
            throw new Error(`Unsupported media type for file: ${path}`);
          }

          const f = file(path);
          const data = await f.arrayBuffer();

          return { data, mediaType: mimeType };
        }));
      }

      await this.scraper.sendTweet(content, undefined);
      console.log('Tweet posted successfully');
    } catch (error) {
      console.error('Error sending tweet:', error);
      throw error;
    }
  }

  async sendConfiguredTweets(configPath: string, options: ScheduleOptions): Promise<void> {
    try {
      const tweets = await TweetConfigLoader.loadTweetsConfig(configPath);
      const delayMinutes = Math.max(options.delayMinutes, this.MIN_DELAY_MINUTES);
      const delayMs = delayMinutes * 60 * 1000;

      console.log(`Delay set to ${delayMinutes} minutes (${delayMs} milliseconds)`);
      const tweetsToSend = options.tweetCount > 0 ? tweets.slice(0, options.tweetCount) : tweets;

      console.log(`Starting tweet schedule:`);
      console.log(`- Will send ${tweetsToSend.length} tweets`);
      console.log(`- Delay between tweets: ${options.delayMinutes} minutes`);
      if (options.proxyUrl) {
        console.log(`- Using proxy: ${options.proxyUrl}`);
      }

      for (let i = 0;i < tweetsToSend.length;i++) {
        const tweet = tweetsToSend[i];
        const nextTweetTime = new Date(Date.now() + (i === 0 ? 0 : delayMs));

        console.log(`\nTweet ${i + 1}/${tweetsToSend.length}:`);
        console.log(`Current time: ${new Date().toLocaleTimeString()}`);
        console.log(`Scheduled time: ${nextTweetTime.toLocaleTimeString()}`);
        console.log(`Content: ${tweet.content}`);

        if (i > 0) {
          console.log(`Waiting ${delayMinutes} minutes before sending...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          console.log(`Wait complete, sending tweet...`);
        }

        await this.sendTweet(tweet.content, tweet.mediaPaths || []);
      }

      console.log('\nAll configured tweets have been sent successfully');
    } catch (error) {
      console.error('Error sending configured tweets:', error);
      throw error;
    }
  }
}
