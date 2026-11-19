import { useRef, useState } from 'react';
import { appConfig } from '../config/appConfig';
import { buildSmsMessage, buildSmsLink, isMobile, copyText } from '../utils/smsHelper';

const COOLDOWN_MS = 15000;

export default function NotificationModal({ latestSong, onClose }) {
  const [step, setStep] = useState('password'); // password | confirm | problem
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [problem, setProblem] = useState('');
  const [note, setNote] = useState('');
  const lastOpen = useRef(0);
  const mobile = isMobile();
  const message = latestSong ? buildSmsMessage(latestSong, appConfig.websiteUrl) : '';

  const checkPassword = (e) => {
    e.preventDefault();
    if (!appConfig.notificationPassword || pw !== appConfig.notificationPassword) {
      setError('Incorrect password.');
      return;
    }
    if (!latestSong) { setProblem('There are no songs yet, so there is nothing to tell her about. Upload a song to Google Drive and refresh.'); setStep('problem'); return; }
    if (!appConfig.smsRecipient) { setProblem('The recipient number is not set. Add VITE_SMS_RECIPIENT_NUMBER (with country code, e.g. +919876543210) to your configuration and rebuild. See the README.'); setStep('problem'); return; }
    setStep('confirm');
  };

  const openSms = () => {
    const wait = lastOpen.current + COOLDOWN_MS - Date.now();
    if (wait > 0) { setNote(`Please wait ${Math.ceil(wait / 1000)} seconds before opening it again.`); return; }
    lastOpen.current = Date.now();
    setNote('Opening your messaging app. Nothing is sent until you press Send there.');
    window.location.href = buildSmsLink(appConfig.smsRecipient, message);
  };

  const copy = async () => setNote((await copyText(message)) ? 'Message copied. Paste it into any chat app.' : 'Could not copy. Select the text above and copy it manually.');

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {step === 'password' && (
          <form onSubmit={checkPassword}>
            <h3>💬</h3>
            <p className="muted">Enter the notification password.</p>
            <input type="password" autoFocus value={pw} onChange={(e) => { setPw(e.target.value); setError(''); }} placeholder="Notification password" aria-label="Notification password" />
            {error && <p className="error" role="alert">{error}</p>}
            <div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>Cancel</button><button className="primary">Continue</button></div>
          </form>
        )}
        {step === 'problem' && (
          <div>
            <h3>One thing first</h3>
            <p className="muted">{problem}</p>
            <div className="modal-actions"><button className="primary" onClick={onClose}>Got it</button></div>
          </div>
        )}
        {step === 'confirm' && (
          <div>
            <h3>Ready to message her?</h3>
            <p className="muted">This will open your messaging app with the text below. You still have to press Send yourself.</p>
            <pre className="preview">{message}</pre>
            {!mobile && <p className="muted small">This looks like a desktop device, which may not have an SMS app. If nothing opens, use "Copy message" and send it from your phone.</p>}
            {note && <p className="note" role="status">{note}</p>}
            <div className="modal-actions">
              <button className="ghost" onClick={onClose}>Close</button>
              <button className="ghost" onClick={copy}>Copy message</button>
              <button className="primary" onClick={openSms}>Open messaging app</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
