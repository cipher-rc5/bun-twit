# bun-twit

## overview

**bun-twit** is a lightweight, developer-friendly Twitter bot built with [Bun](https://bun.sh), designed to automate tweet scheduling and interaction. The bot leverages the `agent-twitter-client` library for Twitter scraping and supports cookie-based authentication, proxy configuration, and tweet scheduling from a JSON file.

---

## features

- **Tweet Scheduling**: Configure delays and tweet counts for automated posting.
- **Proxy Support**: Use proxies for safer and more private interactions.
- **Cookie Management**: Reuse cookies for authentication to reduce login overhead.
- **JSON Configuration**: Define tweets in a structured JSON file.
- **Developer-Friendly**: Built with TypeScript, using Bun's fast runtime.

---

## Prerequisites

Ensure you have the following set up:

1. **[Bun](https://bun.sh)**: Install via:
   ```sh
   curl https://bun.sh/install | bash
   ```
2. Node.js, npm, or Yarn is not required as Bun serves as an all-in-one runtime.
3. Twitter account credentials for login.
4. Data to send composed as `tweets.json`

## installation

1. clone repository

```sh
git clone hhttps://github.com/cipher-rc5/bun-twit.git
cd bun-twit
```

2. install dependencies

```sh
bun install
```

the only dependency for this instance is `agent-twitter-client` which can be installed using:

```sh
bun add agent-twitter-client
```

3. Create a `.env` file based on `.env.example`:

```sh
cp .env.example .env
```

4. Update `.env` with your Twitter credentials and configuration:

```ini
TWITTER_USERNAME=your_username
TWITTER_PASSWORD=your_password
TWITTER_EMAIL=your_email
TWITTER_2FA_SECRET=your_2fa_secret
```

## usage

Running the Bot
To execute the bot and post tweets:

```sh
bun run twitter-client.ts
```

CLI Options
The bot supports the following CLI flags:

- --delay [time]: Set delay between tweets in minutes (default: 2min).
- --count [number]: Specify the number of tweets to send (default: all).
- --proxy [url]: Use a proxy for Twitter requests.

Example:

```sh
bun run src/cli.ts --delay 5 --count 3 --proxy http://proxy.example.com
```

## Tweet Configuration

Tweets are stored in tweets.json. Each tweet includes the following fields:

username (optional): The bot's username for context.
content (required): The tweet text.
hashtags (optional): An array of hashtags.

Example:

```json
[{
  "username": "MortLovesFeet",
  "content": "Good morning, everyone! Mort is here to remind you to smile. 👣✨",
  "hashtags": ["#LemurLife", "#MortKnowsBest"]
}]
```
