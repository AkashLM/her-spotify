const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december'];
const NAME_RE = /^(.+?)-(\d{1,2})_([A-Za-z]+)_(\d{4})-(.*)$/;
export const FALLBACK_DESCRIPTION = 'A song picked just for you ❤️';

const clean = (s) => s.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
const stripExt = (name) => name.replace(/\.[A-Za-z0-9]{2,4}$/, '');

// "Dil_hi_toh_hai-19_November_2026-This_song_is_dedicated_to_her.mp3"
// -> { title, description, dateLabel, dateValue, followsConvention }
export function parseSongFilename(filename) {
  const base = stripExt(String(filename || ''));
  const fallback = { title: clean(base) || 'Untitled', description: FALLBACK_DESCRIPTION, dateLabel: '', dateValue: null, followsConvention: false };
  try {
    const m = NAME_RE.exec(base);
    if (!m) return fallback;
    const day = Number(m[2]);
    const month = MONTHS.indexOf(m[3].toLowerCase());
    const year = Number(m[4]);
    if (month < 0) return fallback;
    const d = new Date(Date.UTC(year, month, day));
    if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month || d.getUTCDate() !== day) return fallback;
    const monthName = m[3][0].toUpperCase() + m[3].slice(1).toLowerCase();
    return {
      title: clean(m[1]) || fallback.title,
      description: clean(m[5]) || FALLBACK_DESCRIPTION,
      dateLabel: `${day} ${monthName} ${year}`,
      dateValue: d.getTime(),
      followsConvention: true,
    };
  } catch {
    return fallback;
  }
}
