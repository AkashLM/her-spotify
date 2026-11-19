const SESSION_KEY = 'forher.session';

// Today's date in the configured timezone, formatted DDMMYYYY.
export function getTodayPassword(timezone) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return get('day') + get('month') + get('year');
}

export function verifyPassword(input, timezone) {
  const today = getTodayPassword(timezone);
  if (String(input).trim() !== today) return false;
  try { sessionStorage.setItem(SESSION_KEY, today); } catch { /* private mode: still lets this tab in */ }
  return true;
}

// Session lasts for the browser tab and only while the stored date is still today.
export function isSessionValid(timezone) {
  try { return sessionStorage.getItem(SESSION_KEY) === getTodayPassword(timezone); } catch { return false; }
}

export function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}
