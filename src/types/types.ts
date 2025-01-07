// types.ts

export type MediaData = { data: ArrayBuffer, mediaType: string };

export type StoredCookies = { cookies: string[], timestamp: number };

export type TweetConfig = { content: string, mediaPaths?: string[] };

export type ScheduleOptions = { delayMinutes: number, tweetCount: number, proxyUrl?: string };
