import { useState } from 'react';
import { appConfig } from '../config/appConfig';
import { verifyPassword } from '../utils/dailyPassword';
import Artwork from './Artwork';

export default function LoginScreen({ onSuccess }) {
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (verifyPassword(value, appConfig.timezone)) onSuccess();
    else setError("That's not quite right. Try again, love ❤️");
  };

  return (
    <main className="login">
      <form className="login-card" onSubmit={submit}>
        <Artwork className="login-art" />
        <h1>{appConfig.siteName}</h1>
        <p className="muted">Songs, saved for you. Enter today's passcode to listen.</p>
        <div className="field">
          <input
            type={show ? 'text' : 'password'}
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            placeholder="Passcode"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            aria-label="Passcode"
          />
          <button type="button" className="ghost" onClick={() => setShow((s) => !s)} aria-pressed={show}>
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="primary wide">Open</button>
      </form>
    </main>
  );
}
