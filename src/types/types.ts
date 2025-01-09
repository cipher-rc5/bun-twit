// types.ts

export type StoredCookies = { cookies: string[], timestamp: number };

export type TweetConfig = { content: string, mediaPaths?: string[] };

export interface MediaData {
  data: Buffer;
  mediaType: string;
}

export interface ScheduleOptions {
  delayMinutes: number;
  tweetCount: number;
  proxyUrl?: string;
}
