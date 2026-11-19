import { appConfig } from '../config/appConfig';

export default function Header({ onRefresh, onMessage, refreshing }) {
  return (
    <header className="topbar">
      <div>
        <div className="brand mobile-brand">❤️ {appConfig.siteName}</div>
        <h2 className="page-title">Your songs</h2>
      </div>
      <div className="topbar-actions">
        <button className="ghost" onClick={onRefresh} disabled={refreshing}>{refreshing ? 'Refreshing…' : 'Refresh'}</button>
        <button className="primary" onClick={onMessage}>Send Her a Message ❤️</button>
      </div>
    </header>
  );
}
