// src/utils/time-parser.ts

export function parseTimeString(timeStr: string): number {
  const match = timeStr.match(/^(\d+)(min|minutes|m)?$/i);
  if (!match) {
    throw new Error('Invalid time format. Use format: "5min" or just "5"');
  }
  return parseInt(match[1]);
}
