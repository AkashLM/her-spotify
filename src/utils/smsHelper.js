export function buildSmsMessage(song, websiteUrl) {
  return [
    'Hey ❤️ A new song is waiting for you!',
    '',
    `Song: ${song.title}`,
    '',
    `Date: ${song.dateLabel}`,
    '',
    `A little message: ${song.description}`,
    '',
    `Listen here: ${websiteUrl}`,
    '',
    'Made with love ❤️',
  ].join('\n');
}

const iPadOS = () => navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
export const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || iPadOS();
export const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || iPadOS();

// iOS uses "&body=", Android uses "?body=". The body is URL-encoded either way.
export function buildSmsLink(number, body) {
  const encoded = encodeURIComponent(body);
  return isIOS() ? `sms:${number}&body=${encoded}` : `sms:${number}?body=${encoded}`;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch { return false; }
  }
}
