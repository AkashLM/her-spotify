# For Her ❤️ – Personal Music Player

A Spotify-inspired dark music player for one special person. 100% frontend: React + Vite, songs read from a Google Drive folder, hosted free on GitHub Pages. No backend, database, SMS gateway or paid service.

**Stack:** React 18, Vite 5, JavaScript, HTML5 Audio, CSS3, Google Drive API v3, GitHub Actions + GitHub Pages.

## Project structure

```text
for-her-music-player/
├── .github/workflows/deploy.yml   GitHub Pages deployment
├── public/
├── src/
│   ├── components/  LoginScreen, Header, Sidebar, SongList, SongCard, MusicPlayer,
│   │                MusicVisualizer, NotificationModal, Artwork
│   ├── services/googleDriveService.js
│   ├── utils/       songMetadataParser, artworkGenerator, dailyPassword, smsHelper
│   ├── config/appConfig.js        all settings in one place
│   ├── styles/global.css
│   ├── App.jsx, main.jsx
├── .env.example, .gitignore, index.html, package.json, vite.config.js
```

## IMPORTANT: security reality

Everything is frontend-only, so **every `VITE_` value (API key, recipient number, notification password) and the daily-password logic are visible to anyone who inspects the website's JavaScript.** The daily passcode and the notification password are lightweight convenience checks, not real security. Don't use them to protect anything private. Anyone with the website link and some technical skill can open it, and the songs in a link-shared Drive folder can be reached by anyone who finds the file links.

## 1. Local setup (beginner steps)

1. Install **Node.js** (LTS) from nodejs.org and **Visual Studio Code** from code.visualstudio.com.
2. Create a free **GitHub** account at github.com.
3. Create a new GitHub repository named `for-her-music-player` (public; GitHub Pages is free for public repos).
4. Unzip this project and open the folder in VS Code.
5. Copy `.env.example` to a new file named `.env` and edit it (see "Configuration").
6. In the VS Code terminal: `npm install`, then `npm run dev`. Open the address it prints.

## 2. Google Drive API setup

1. Go to console.cloud.google.com and create a project.
2. **APIs & Services → Library →** search "Google Drive API" → **Enable**.
3. **APIs & Services → Credentials → Create credentials → API key**.
4. Edit the key and restrict it:
   - **API restrictions:** Restrict key → select **Google Drive API** only.
   - **Application restrictions:** HTTP referrers → add `http://localhost:5173/*` (for local testing) and `https://YOUR_USERNAME.github.io/*` (for the live site).
5. Put the key in `.env` as `VITE_GOOGLE_DRIVE_API_KEY`.

### Folder sharing
In Google Drive, right-click the songs folder → Share → General access → **Anyone with the link → Viewer**. Without this the API returns 403/404 and nothing loads.

## 3. Audio playback limitations (read this)

- Google Drive "preview" and `uc?export=download` links are **not** reliable in an HTML `<audio>` tag (redirects, virus-scan pages, no consistent CORS/range support), so this project does not use them.
- Instead the player streams `https://www.googleapis.com/drive/v3/files/FILE_ID?alt=media&key=KEY`. This is the most practical frontend-only method and is designed to work for link-shared files. **I could not test it against your Drive from where I built this project, so verify it yourself with the checklist below.**
- Google may throttle heavily played files ("download quota exceeded"), which shows as a playback error. Seeking needs the browser's HTTP range requests; if a file can't seek, that's a Drive limitation.
- If a song fails, the player shows an error and an "Open in Google Drive" link. It never pretends the song is playing.
- Prefer MP3 or M4A: they play in all major browsers. OGG does not play on Safari/iPhone.
- Browsers block autoplay until you interact with the page, so "auto-play next song" may need one initial tap.

## 4. Filename convention

`SongName-DD_Month_YYYY-Description.mp3`

Example: `Dil_hi_toh_hai-19_November_2026-This_song_is_dedicated_to_her.mp3` → title "Dil hi toh hai", date "19 November 2026", description "This song is dedicated to her".

Underscores become spaces; the extension is removed. If a name doesn't match (or has an invalid date), the original filename becomes the title with the description "A song picked just for you ❤️" and the date shown is the Drive upload date. Songs are sorted by the Drive upload (created) time, newest first. Supported: MP3, WAV, M4A, AAC, OGG.

## 5. Configuration (`.env`)

| Variable | Meaning |
|---|---|
| `VITE_WEBSITE_NAME` | Name shown in the app |
| `VITE_GOOGLE_DRIVE_FOLDER_ID` | Folder ID from the Drive URL |
| `VITE_GOOGLE_DRIVE_API_KEY` | Your restricted API key |
| `VITE_WEBSITE_URL` | Your GitHub Pages URL, used in the SMS text (e.g. `https://USER.github.io/for-her-music-player/`) |
| `VITE_SMS_RECIPIENT_NUMBER` | Her number with country code, e.g. `+919876543210` |
| `VITE_TIMEZONE` | `Asia/Kolkata` |
| `VITE_NOTIFICATION_PASSWORD` | Password for the message button |

Never commit `.env` (it's in `.gitignore`). After any change, restart `npm run dev` locally, or **redeploy** the live site, because values are baked in at build time.

**Update the recipient number / notification password:** change `VITE_SMS_RECIPIENT_NUMBER` / `VITE_NOTIFICATION_PASSWORD` in `.env` locally, and in GitHub secrets (below) for the live site, then redeploy.

## 6. Daily password

The passcode is today's date in `Asia/Kolkata` as `DDMMYYYY` (e.g. 19 November 2026 → `19112026`), computed at runtime, never hardcoded. Access lasts for the browser tab session; when the Indian date changes, the app locks again (checked every 30 seconds and on reload).

## 7. SMS message button

"💬" → enter the notification password → preview of the message with the **latest song** → "Open messaging app". This opens your device's default SMS app via an `sms:` link with the text prefilled; **you must press Send yourself. Nothing is sent automatically.**

- No songs, or recipient number not configured → a helpful message and no SMS app opens.
- Desktop devices without an SMS handler may do nothing; use "Copy message".
- A 15-second cooldown prevents accidental repeated opening.
- iPhone and Android use slightly different `sms:` formats; both are handled but test on your own phone.

## 8. Deploy to GitHub Pages

1. In your project folder: `git init`, `git add .`, `git commit -m "First version"`, `git branch -M main`, `git remote add origin https://github.com/YOUR_USERNAME/for-her-music-player.git`, `git push -u origin main` (check `.env` is not listed).
2. On GitHub: **Settings → Secrets and variables → Actions → New repository secret.** Add all seven: `VITE_WEBSITE_NAME`, `VITE_GOOGLE_DRIVE_FOLDER_ID`, `VITE_GOOGLE_DRIVE_API_KEY`, `VITE_WEBSITE_URL`, `VITE_SMS_RECIPIENT_NUMBER`, `VITE_TIMEZONE`, `VITE_NOTIFICATION_PASSWORD`. (They still end up public in the built site.)
3. **Settings → Pages → Source: GitHub Actions.**
4. Push to `main` (or Actions tab → "Deploy to GitHub Pages" → Run workflow). Wait for the green tick.
5. Open `https://YOUR_USERNAME.github.io/for-her-music-player/` and test on your phone.

`vite.config.js` uses `base: './'`, so it works under any repository URL. To redeploy after code or configuration changes: update the secret if needed, then push, or re-run the workflow.

## 9. Uploading new songs
Upload to the Drive folder using the filename convention. Refresh the website or press Refresh. No redeploy needed. New files inherit the folder's sharing; if one doesn't play, check its sharing.

## 10. Troubleshooting

- **"Setup needed" screen:** `.env` missing or key still placeholder.
- **403 "Google Drive refused access":** Drive API not enabled, key referrer restriction doesn't include your site URL, or the folder isn't "Anyone with the link".
- **404:** wrong folder ID, or folder not shared.
- **Songs list loads but playback fails:** check the file's sharing, the key's referrer list, try MP3, check Drive download quota; use "Open in Google Drive".
- **Live site blank / assets 404:** make sure Pages source is "GitHub Actions" and the build succeeded.
- **Live site says setup needed:** the GitHub secrets are missing; add them and re-run the workflow.
- **SMS app doesn't open:** use a phone, check the recipient number includes country code, or use Copy message.
- **Password rejected:** it's today's date in India (DDMMYYYY), not your local date.

## 11. Testing checklist

- [ ] `npm run build` succeeds
- [ ] Wrong passcode shows an error; today's IST date works; show/hide works
- [ ] Songs load, newest first; a badly named file still shows
- [ ] Empty folder shows the "No songs yet" message; invalid key shows a clear error
- [ ] Play/pause, next/prev, seek (drag the bar), ±10 s, volume, mute
- [ ] Shuffle, repeat all, repeat one; song ends → next song
- [ ] Playback works on desktop and on your phone (this is the key Drive check)
- [ ] Current song highlighted; visualizer animates only while playing
- [ ] Add a new Drive file → Refresh → it appears without redeploy
- [ ] Message button: wrong password error; with no recipient number a config message; correct setup opens the SMS app with the text; you press Send
- [ ] Live site works at the GitHub Pages URL
