import { useState } from 'react';

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [token, setToken] = useState('');

  return (
    <div style={{ padding: 24 }}>
      <h2>Blood Script Companion</h2>
      <p>Paste your session token:</p>
      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={{ width: '100%' }}
      />
      <button onClick={() => onLogin(token)} style={{ marginTop: 12 }}>
        Enter
      </button>
    </div>
  );
}