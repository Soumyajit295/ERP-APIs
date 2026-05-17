export function calculateExpiry(ttl: string): Date {
  const match = ttl.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error("Invalid TTL format");
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  const now = new Date();

  switch (unit) {
    case 's':
      now.setSeconds(now.getSeconds() + value);
      break;
    case 'm':
      now.setMinutes(now.getMinutes() + value);
      break;
    case 'h':
      now.setHours(now.getHours() + value);
      break;
    case 'd':
      now.setDate(now.getDate() + value);
      break;
  }

  return now;
}

export function parseMaxAge(ttl: string): number {
    const value = parseInt(ttl);

    if (ttl.endsWith('d')) {
        return value * 24 * 60 * 60 * 1000;
    }

    if (ttl.endsWith('h')) {
        return value * 60 * 60 * 1000;
    }

    if (ttl.endsWith('m')) {
        return value * 60 * 1000;
    }

    if (ttl.endsWith('s')) {
        return value * 1000;
    }

    return value;
}