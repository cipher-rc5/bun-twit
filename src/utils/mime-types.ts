// src/utils/mime-types.ts

export function getMimeType(extension: string | undefined): string | undefined {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    mp4: 'video/mp4'
  };
  return extension ? mimeTypes[extension] : undefined;
}
