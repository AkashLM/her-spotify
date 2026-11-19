import { appConfig } from '../config/appConfig';
import { parseSongFilename } from '../utils/songMetadataParser';

const API = 'https://www.googleapis.com/drive/v3/files';
const EXT_RE = /\.(mp3|wav|m4a|aac|ogg)$/i;
const AUDIO_MIMES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/aac', 'audio/ogg', 'application/ogg'];

// Playable URL. Works only for files the folder's "Anyone with the link" access exposes
// and when the API key allows this website (see README, "Audio playback limitations").
export const getAudioUrl = (id) => `${API}/${id}?alt=media&key=${encodeURIComponent(appConfig.driveApiKey)}`;
export const getDriveViewUrl = (id) => `https://drive.google.com/file/d/${id}/view`;

const isSupported = (f) => EXT_RE.test(f.name) || AUDIO_MIMES.includes(f.mimeType);

function friendlyError(status, googleMessage) {
  if (status === 400) return 'Google rejected the request. Check that the API key and folder ID are correct.';
  if (status === 403) return 'Google Drive refused access. Make sure the Drive API is enabled, the API key allows this website address, and the folder is shared as "Anyone with the link – Viewer".';
  if (status === 404) return 'The Drive folder was not found. Check the folder ID and that the folder is shared with "Anyone with the link".';
  return `Google Drive returned an error (${status}${googleMessage ? `: ${googleMessage}` : ''}).`;
}

export async function fetchSongs() {
  const files = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({
      q: `'${appConfig.driveFolderId}' in parents and trashed=false`,
      fields: 'nextPageToken,files(id,name,mimeType,createdTime)',
      orderBy: 'createdTime desc',
      pageSize: '1000',
      key: appConfig.driveApiKey,
    });
    if (pageToken) params.set('pageToken', pageToken);
    let res;
    try {
      res = await fetch(`${API}?${params}`);
    } catch {
      throw new Error('Could not reach Google Drive. Check your internet connection and try again.');
    }
    if (!res.ok) {
      let msg = '';
      try { msg = (await res.json())?.error?.message || ''; } catch { /* ignore */ }
      throw new Error(friendlyError(res.status, msg));
    }
    const data = await res.json();
    files.push(...(data.files || []));
    pageToken = data.nextPageToken || '';
  } while (pageToken);

  return files
    .filter(isSupported)
    .map((f) => {
      const meta = parseSongFilename(f.name);
      const created = f.createdTime ? new Date(f.createdTime) : null;
      return {
        id: f.id,
        fileName: f.name,
        title: meta.title,
        description: meta.description,
        dateLabel: meta.dateLabel || (created ? created.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: appConfig.timezone }) : ''),
        sortTime: created ? created.getTime() : meta.dateValue || 0,
        audioUrl: getAudioUrl(f.id),
        driveUrl: getDriveViewUrl(f.id),
      };
    })
    .sort((a, b) => b.sortTime - a.sortTime);
}
