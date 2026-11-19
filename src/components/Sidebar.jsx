import { appConfig } from '../config/appConfig';

export default function Sidebar({ count, onRefresh, onMessage, onLock }) {
  return (
    <aside className="sidebar">
      <div className="brand">❤️ {appConfig.siteName}</div>
      <nav>
        <button className="nav-item active">Songs <span className="pill">{count}</span></button>
        <button className="nav-item" onClick={onRefresh}>Refresh songs</button>
        <button className="nav-item" onClick={onMessage}>Send Her a Message ❤️</button>
      </nav>
      <button className="nav-item lock" onClick={onLock}>Lock</button>
    </aside>
  );
}
