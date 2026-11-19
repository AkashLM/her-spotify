export default function MusicVisualizer({ active }) {
  return (
    <span className={`visualizer ${active ? 'on' : ''}`} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => <i key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
    </span>
  );
}
