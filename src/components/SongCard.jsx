import Artwork from './Artwork';
import MusicVisualizer from './MusicVisualizer';

export default function SongCard({ song, isCurrent, isPlaying, onPlay }) {
  return (
    <button className={`card ${isCurrent ? 'current' : ''}`} onClick={() => onPlay(song)} aria-current={isCurrent}>
      <div className="card-art">
        <Artwork song={song} />
        {isCurrent && <div className="card-badge"><MusicVisualizer active={isPlaying} /></div>}
      </div>
      <div className="card-title">{song.title}</div>
      <div className="card-desc">{song.description}</div>
      <div className="card-date">{song.dateLabel}</div>
    </button>
  );
}
