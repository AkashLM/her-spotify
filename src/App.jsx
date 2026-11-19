import { useCallback, useEffect, useState } from 'react';
import { appConfig, getConfigProblems } from './config/appConfig';
import { fetchSongs } from './services/googleDriveService';
import { isSessionValid, clearSession } from './utils/dailyPassword';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SongList from './components/SongList';
import MusicPlayer from './components/MusicPlayer';
import NotificationModal from './components/NotificationModal';

export default function App() {
  const [authed, setAuthed] = useState(() => isSessionValid(appConfig.timezone));
  const [songs, setSongs] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(null);
  const [playRequest, setPlayRequest] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [modal, setModal] = useState(false);
  const problems = getConfigProblems();

  // Lock again when the Indian date changes while the page is open.
  useEffect(() => {
    if (!authed) return undefined;
    const t = setInterval(() => { if (!isSessionValid(appConfig.timezone)) setAuthed(false); }, 30000);
    return () => clearInterval(t);
  }, [authed]);

  const load = useCallback(async () => {
    setStatus((s) => (s === 'ready' ? s : 'loading'));
    setError('');
    try {
      const list = await fetchSongs();
      setSongs(list);
      setStatus('ready');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  useEffect(() => { if (authed && problems.length === 0) load(); }, [authed]); // eslint-disable-line react-hooks/exhaustive-deps

  const select = useCallback((song) => { setCurrent(song); setPlayRequest((n) => n + 1); }, []);
  const lock = () => { clearSession(); setAuthed(false); setCurrent(null); setPlaying(false); };

  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />;

  const latest = songs[0] || null; // songs are sorted newest first

  return (
    <div className="app">
      <Sidebar count={songs.length} onRefresh={refresh} onMessage={() => setModal(true)} onLock={lock} />
      <div className="main">
        <Header onRefresh={refresh} onMessage={() => setModal(true)} refreshing={refreshing} />
        <div className="content">
          {problems.length > 0 && (
            <div className="state error-box"><h3>Setup needed</h3>{problems.map((p) => <p key={p}>{p}</p>)}</div>
          )}
          {problems.length === 0 && status === 'loading' && <div className="state"><span className="spinner" /> Loading songs…</div>}
          {problems.length === 0 && status === 'error' && (
            <div className="state error-box"><h3>Couldn't load songs</h3><p>{error}</p><button className="primary" onClick={refresh}>Try again</button></div>
          )}
          {problems.length === 0 && status === 'ready' && songs.length === 0 && (
            <div className="state"><h3>No songs yet</h3><p className="muted">Upload an MP3, WAV, M4A, AAC or OGG file to the Drive folder, then press Refresh.</p></div>
          )}
          {status === 'ready' && songs.length > 0 && <SongList songs={songs} current={current} playing={playing} onPlay={select} />}
        </div>
      </div>
      <MusicPlayer songs={songs} current={current} playRequest={playRequest} onSelect={select} onPlayingChange={setPlaying} />
      {modal && <NotificationModal latestSong={latest} onClose={() => setModal(false)} />}
    </div>
  );
}
