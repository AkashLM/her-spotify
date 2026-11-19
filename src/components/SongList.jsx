import SongCard from './SongCard';

export default function SongList({ songs, current, playing, onPlay }) {
  return (
    <section className="grid" aria-label="Song list">
      {songs.map((s) => (
        <SongCard key={s.id} song={s} isCurrent={current?.id === s.id} isPlaying={playing} onPlay={onPlay} />
      ))}
    </section>
  );
}
