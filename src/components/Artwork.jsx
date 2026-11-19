import { generateArtwork, FALLBACK_ARTWORK } from '../utils/artworkGenerator';

const HEART = 'M50 80 C18 56 22 26 41 28 C46 29 50 35 50 35 C50 35 54 29 59 28 C78 26 82 56 50 80Z';

export default function Artwork({ song, className = '' }) {
  const a = song ? generateArtwork(song.title, song.description) : FALLBACK_ARTWORK;
  const gid = `g-${a.id}`;
  return (
    <svg className={`artwork ${className}`} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label={song ? `Artwork for ${song.title}` : 'For Her artwork'}>
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100" gradientTransform={`rotate(${a.angle} 50 50)`}>
          <stop offset="0" stopColor={a.colors[0]} />
          <stop offset="1" stopColor={a.colors[1]} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gid})`} />
      {a.blobs.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#fff" opacity={b.o} />)}
      {a.ring && <circle cx={a.ring.x} cy={a.ring.y} r={a.ring.r} fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.2" />}
      {a.heart && (
        <g transform={`translate(${a.heart.x} ${a.heart.y}) rotate(${a.heart.rot}) scale(${a.heart.s * 0.6}) translate(-50 -50)`}>
          <path d={HEART} fill="#fff" opacity={a.heart.o} />
        </g>
      )}
    </svg>
  );
}
