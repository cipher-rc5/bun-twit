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
To execute the bot and post all tweets with a two minute(default delay):

```sh
bun run src/cli.ts
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

Advanced Options
Customize tweet scheduling with command-line arguments:

### send 5 tweets with 3-minute delays

```sh
bun run src/cli.ts --count 5 --delay 3min
```

### use a proxy server

```sh
bun run src/cli.ts --proxy http://your-proxy-url:port
```

## tweet configuration

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

## development

### project Structure

bun-twit/
├── .env.example # Environment variable template
├── tweets.json # Pre-configured tweets
├── src/
│ ├── cli.ts # CLI entry point
│ ├── twitter-client.ts # Twitter client logic
│ ├── services/ # Modular service files
│ │ ├── cookie-manager.ts
│ │ ├── proxy-manager.ts
│ │ ├── tweet-config-loader.ts
│ ├── utils/ # Utility functions
│ │ ├── mime-types.ts
│ │ ├── time-parser.ts
│ ├── types/ # Type definitions
│ ├── types.ts

### Cookie Management

The client automatically manages Twitter authentication cookies:

- Cookies are stored in twitter_cookies.json
- Default cookie expiration is 24 hours
- Failed cookie authentication falls back to credential login

### Media Support

Supported media formats:

- Images: .jpg, .jpeg, .png
- Animated: .gif
- Video: .mp4

### Error Handling

The client includes robust error handling for:

- Authentication failures
- Network issues
- Invalid media types
- Configuration errors
