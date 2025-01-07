// src/services/tweet-config-loader.ts

import { file } from 'bun';
import type { TweetConfig } from '../types/types';

export class TweetConfigLoader {
  static async loadTweetsConfig(configPath: string): Promise<TweetConfig[]> {
    try {
      const configFile = file(configPath);
      const configData = await configFile.text();
      const tweets: TweetConfig[] = JSON.parse(configData);

      if (!Array.isArray(tweets)) {
        throw new Error('Tweets configuration must be an array');
      }

      tweets.forEach((tweet, index) => {
        if (!tweet.content) {
          throw new Error(`Tweet at index ${index} is missing required 'content' field`);
        }
      });

      return tweets;
    } catch (error) {
      console.error('Error loading tweets configuration:', error);
      throw error;
    }
  }
}
