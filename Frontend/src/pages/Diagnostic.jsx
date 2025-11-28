import { useEffect, useState } from 'react';

export default function DiagnosticPage() {
  const [results, setResults] = useState({
    backendHealth: null,
    backendRegister: null,
    frontendUrl: typeof window !== 'undefined' ? window.location.origin : 'unknown',
  });

  useEffect(() => {
    async function runDiags() {
      // Test backend health
      try {
        const h = await fetch('http://localhost:5000/health', { method: 'GET', timeout: 5000 });
        const hData = await h.json();
        setResults(r => ({ ...r, backendHealth: { status: h.status, data: hData } }));
      } catch (err) {
        setResults(r => ({ ...r, backendHealth: { error: err.message } }));
      }

      // Test backend register endpoint
      try {
        const r = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Diag', email: 'diag@test.local', password: 'test1234' }),
          timeout: 5000,
        });
        const rData = await r.json();
        setResults(prev => ({ ...prev, backendRegister: { status: r.status, data: rData } }));
      } catch (err) {
        setResults(prev => ({ ...prev, backendRegister: { error: err.message } }));
      }
    }
    runDiags();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      <h1>Diagnostic Check</h1>
      <p>Frontend URL: {results.frontendUrl}</p>
      <hr />
      <h2>Backend Health</h2>
      <p>{JSON.stringify(results.backendHealth, null, 2)}</p>
      <hr />
      <h2>Backend Register</h2>
      <p>{JSON.stringify(results.backendRegister, null, 2)}</p>
    </div>
  );
}
