import { useEffect, useRef, useState } from 'react';
import Artwork from './Artwork';
import MusicVisualizer from './MusicVisualizer';

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

export default function MusicPlayer({ songs, current, playRequest, onSelect, onPlayingChange }) {
  const audioRef = useRef(null);
  const live = useRef({});
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // off | all | one
  live.current = { songs, current, shuffle, repeat, time };

  useEffect(() => { onPlayingChange(playing); }, [playing, onPlayingChange]);

  // Load and play whenever a song is chosen (or the same song is chosen again).
  useEffect(() => {
    const a = audioRef.current;
    if (!current || !a) return;
    setError(''); setLoading(true); setTime(0); setDuration(0);
    a.src = current.audioUrl;
    a.load();
    a.play().catch((err) => {
      setLoading(false);
      if (err.name === 'NotAllowedError') setError('Your browser blocked autoplay. Press play to start.');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, playRequest]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) { a.volume = volume; a.muted = muted; }
  }, [volume, muted]);

  const index = () => live.current.songs.findIndex((s) => s.id === live.current.current?.id);

  const goNext = (auto) => {
    const { songs: list, shuffle: sh, repeat: rp } = live.current;
    if (!list.length) return;
    const i = index();
    if (sh && list.length > 1) {
      let j;
      do { j = Math.floor(Math.random() * list.length); } while (j === i);
      onSelect(list[j]);
    } else if (i < list.length - 1) onSelect(list[i + 1]);
    else if (rp === 'all' || !auto) onSelect(list[0]);
    else setPlaying(false);
  };

  const goPrev = () => {
    const a = audioRef.current;
    const i = index();
    if (live.current.time > 3 || i <= 0) { if (a) a.currentTime = 0; }
    else onSelect(live.current.songs[i - 1]);
  };

  const togglePlay = () => {
    const a = audioRef.current;
    if (!live.current.current) { if (songs[0]) onSelect(songs[0]); return; }
    if (a.paused) {
      setError('');
      a.play().catch(() => setError('Could not start playback. Try another song or refresh.'));
    } else a.pause();
  };

  const skip = (sec) => {
    const a = audioRef.current;
    if (a && duration) a.currentTime = Math.min(Math.max(0, a.currentTime + sec), duration);
  };

  const onEnded = () => {
    const a = audioRef.current;
    if (live.current.repeat === 'one') { a.currentTime = 0; a.play().catch(() => setPlaying(false)); }
    else goNext(true);
  };

  const onAudioError = () => {
    setLoading(false); setPlaying(false);
    setError("This song can't be played. The file may be in an unsupported format, or Google Drive blocked the stream (check sharing and API key restrictions).");
  };

  const cycleRepeat = () => setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <footer className="player">
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onPlaying={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onTimeUpdate={(e) => setTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={onEnded}
        onError={onAudioError}
      />
      <div className="np">
        <Artwork song={current} className="np-art" />
        <div className="np-text">
          <div className="np-title">{current ? current.title : 'Pick a song'}</div>
          <div className="np-desc">{current ? current.description : 'Tap any song to start listening'}</div>
          {current && current.dateLabel && <div className="np-date">{current.dateLabel}</div>}
        </div>
        <MusicVisualizer active={playing && !loading} />
      </div>

      <div className="controls">
        <div className="buttons">
          <button className={`icon ${shuffle ? 'active' : ''}`} onClick={() => setShuffle((s) => !s)} aria-pressed={shuffle} title="Shuffle">⇄</button>
          <button className="icon" onClick={goPrev} title="Previous" aria-label="Previous song">⏮</button>
          <button className="icon sm" onClick={() => skip(-10)} title="Back 10 seconds" aria-label="Back 10 seconds">−10</button>
          <button className="play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>{loading && current ? '…' : playing ? '❚❚' : '▶'}</button>
          <button className="icon sm" onClick={() => skip(10)} title="Forward 10 seconds" aria-label="Forward 10 seconds">+10</button>
          <button className="icon" onClick={() => goNext(false)} title="Next" aria-label="Next song">⏭</button>
          <button className={`icon ${repeat !== 'off' ? 'active' : ''}`} onClick={cycleRepeat} title={`Repeat: ${repeat}`} aria-label={`Repeat ${repeat}`}>
            {repeat === 'one' ? '🔂' : '🔁'}
          </button>
        </div>
        <div className="seek">
          <span>{fmt(time)}</span>
          <input
            type="range" min="0" max={duration || 0} step="0.1" value={time}
            style={{ '--pct': `${pct}%` }} aria-label="Seek"
            onChange={(e) => { const a = audioRef.current; a.currentTime = Number(e.target.value); setTime(a.currentTime); }}
            disabled={!duration}
          />
          <span>{fmt(duration)}</span>
        </div>
        {error && <div className="player-error" role="alert">{error}{current && <> <a href={current.driveUrl} target="_blank" rel="noreferrer">Open in Google Drive</a></>}</div>}
      </div>

      <div className="volume">
        <button className="icon" onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Unmute' : 'Mute'}>{muted || volume === 0 ? '🔇' : '🔊'}</button>
        <input
          type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume}
          style={{ '--pct': `${(muted ? 0 : volume) * 100}%` }} aria-label="Volume"
          onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
        />
      </div>
    </footer>
  );
}
