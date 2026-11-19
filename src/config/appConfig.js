// Single place for all settings. Values come from Vite env variables (.env locally,
// GitHub secrets in production). Everything here is public in the built website.
const env = import.meta.env;
const isPlaceholder = (v) => !v || String(v).trim() === '' || String(v).startsWith('YOUR_');

export const appConfig = {
  siteName: env.VITE_WEBSITE_NAME || 'For Her',
  driveFolderId: env.VITE_GOOGLE_DRIVE_FOLDER_ID || '',
  driveApiKey: isPlaceholder(env.VITE_GOOGLE_DRIVE_API_KEY) ? '' : env.VITE_GOOGLE_DRIVE_API_KEY,
  websiteUrl: isPlaceholder(env.VITE_WEBSITE_URL)
    ? window.location.origin + window.location.pathname
    : env.VITE_WEBSITE_URL,
  smsRecipient: isPlaceholder(env.VITE_SMS_RECIPIENT_NUMBER)
    ? ''
    : String(env.VITE_SMS_RECIPIENT_NUMBER).replace(/[^\d+]/g, ''),
  timezone: env.VITE_TIMEZONE || 'Asia/Kolkata',
  notificationPassword: env.VITE_NOTIFICATION_PASSWORD || '',
};

// Problems that stop the site from working at all.
export function getConfigProblems() {
  const problems = [];
  if (!appConfig.driveFolderId) problems.push('VITE_GOOGLE_DRIVE_FOLDER_ID is missing.');
  if (!appConfig.driveApiKey)
    problems.push('VITE_GOOGLE_DRIVE_API_KEY is missing or still the placeholder. Add your Google API key (see README).');
  return problems;
}
