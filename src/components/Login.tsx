import { useState } from 'react';

const API_BASE = 'http://localhost:3000';

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [engineId, setEngineId] = useState('');

  const loginWithDiscord = () => {
    if (!engineId.trim()) {
      alert('Enter Engine ID first.');
      return;
    }

    // Backend will redirect to Discord, then back to app with ?token=...
    const url = new URL(`${API_BASE}/auth/discord/login`);
    url.searchParams.set('engineId', engineId.trim());
    window.location.href = url.toString();
  };

  return (
    <div style={{ padding: 24, maxWidth: 560 }}>
      <h2>Blood Script Companion</h2>

      <p style={{ opacity: 0.85 }}>
        Enter your Engine ID (server/chronicle instance), then sign in with Discord.
      </p>

      <label style={{ display: 'block', marginBottom: 8 }}>
        Engine ID
      </label>
      <input
        value={engineId}
        onChange={(e) => setEngineId(e.target.value)}
        placeholder="UUID from your engine record"
        style={{ width: '100%', marginBottom: 12 }}
      />

      <button onClick={loginWithDiscord} style={{ padding: '10px 14px' }}>
        Login with Discord
      </button>

      <hr style={{ margin: '16px 0' }} />

      <details>
        <summary>Troubleshooting</summary>
        <ul>
          <li>Make sure the backend .env has DISCORD_CLIENT_ID / SECRET / REDIRECT_URI.</li>
          <li>Make sure Discord OAuth redirect URI matches exactly.</li>
          <li>After login, you should land back here already logged in.</li>
        </ul>
      </details>
    </div>
  );
}