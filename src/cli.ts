// cli.ts

import { TwitterClient } from './twitter-client';
import { type ScheduleOptions } from './types/types';
import { parseTimeString } from './utils/time-parser';

function parseArgs(): ScheduleOptions {
  const args = process.argv.slice(2);
  let delayMinutes = 2;
  let tweetCount = 0;
  let proxyUrl: string | undefined;

  for (let i = 0;i < args.length;i++) {
    if (args[i] === '--delay' && i + 1 < args.length) {
      const timeStr = args[i + 1];
      delayMinutes = parseTimeString(timeStr);
      i++;
    } else if (args[i] === '--count' && i + 1 < args.length) {
      tweetCount = parseInt(args[i + 1]);
      if (isNaN(tweetCount) || tweetCount < 1) {
        throw new Error('Count must be a positive number');
      }
      i++;
    } else if (args[i] === '--proxy' && i + 1 < args.length) {
      proxyUrl = args[i + 1];
      i++;
    }
  }

  return { delayMinutes, tweetCount, proxyUrl };
}

async function main() {
  try {
    const options = parseArgs();
    const client = new TwitterClient('./twitter_cookies.json', 24, options.proxyUrl);
    await client.login();
    await client.sendConfiguredTweets('./tweets.json', options);
  } catch (error) {
    console.error('Failed to send tweets:', error);
    process.exit(1);
  }
}

main();
