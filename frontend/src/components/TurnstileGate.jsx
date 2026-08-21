import { useEffect, useRef, useState } from 'react';
import API from '../api/axios';

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
const GATE_STORAGE_KEY = 'turnstile_gate_pass';

const loadTurnstileScript = () =>
  new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve(window.turnstile);
      return;
    }

    const existing = document.getElementById(TURNSTILE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.turnstile), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Turnstile script')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => reject(new Error('Failed to load Turnstile script'));
    document.head.appendChild(script);
  });

const getStoredGatePass = () => {
  try {
    const raw = window.localStorage.getItem(GATE_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.expiresAt) {
      return null;
    }

    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      window.localStorage.removeItem(GATE_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const storeGatePass = (value) => {
  try {
    window.localStorage.setItem(GATE_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures and continue with the active session.
  }
};

const TurnstileGate = ({ children }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [status, setStatus] = useState(() => (getStoredGatePass() ? 'verified' : 'loading'));
  const [siteKey, setSiteKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (status === 'verified') {
      return;
    }

    const fetchConfig = async () => {
      try {
        const { data } = await API.get('/auth/turnstile/config');
        if (!data?.enabled || !data?.siteKey) {
          setStatus('verified');
          return;
        }

        setSiteKey(data.siteKey);
        setStatus('ready');
      } catch (error) {
        setErrorMessage('Unable to start human verification right now.');
        setStatus('error');
      }
    };

    fetchConfig();
  }, [status]);

  useEffect(() => {
    if (status !== 'ready' || !siteKey || !containerRef.current) {
      return;
    }

    let cancelled = false;

    const mountWidget = async () => {
      try {
        const turnstile = await loadTurnstileScript();
        if (cancelled || !containerRef.current) {
          return;
        }

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'dark',
          appearance: 'always',
          callback: async (token) => {
            setStatus('verifying');
            setErrorMessage('');

            try {
              const { data } = await API.post('/auth/turnstile/verify', { token });
              storeGatePass({
                token: data?.token || '',
                expiresAt: data?.expiresAt || new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
              });
              setStatus('verified');
            } catch (error) {
              setErrorMessage(error.response?.data?.message || 'Verification failed. Please try again.');
              setStatus('ready');
              if (widgetIdRef.current && window.turnstile) {
                window.turnstile.reset(widgetIdRef.current);
              }
            }
          },
          'error-callback': () => {
            setErrorMessage('Turnstile encountered an error. Please retry.');
            setStatus('ready');
          },
          'expired-callback': () => {
            setErrorMessage('Verification expired. Please try again.');
            setStatus('ready');
          },
        });
      } catch (error) {
        setErrorMessage('Unable to load human verification.');
        setStatus('error');
      }
    };

    mountWidget();

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, status]);

  if (status === 'verified') {
    return children;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,rgb(49_66_42),rgb(12_25_39))] text-slate-100">
      <div className="pointer-events-none absolute inset-0 subtle-grid opacity-[0.14]" />
      <div className="pointer-events-none absolute -left-16 top-12 h-56 w-56 rounded-full bg-cyan-300/12 blur-[90px]" />
      <div className="pointer-events-none absolute -right-12 bottom-12 h-48 w-48 rounded-full bg-amber-200/10 blur-[90px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="glass-card w-full max-w-md border-white/10 p-8 md:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Security Check</p>
          <h1 className="mt-3 font-serif text-3xl text-slate-100">
            Verifying <span className="text-cyan-200">Human Visitor</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            A quick Cloudflare Turnstile check runs before the portfolio or admin login page loads.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            {(status === 'loading' || status === 'verifying') && (
              <div className="mb-4 flex items-center gap-3 text-sm text-slate-300">
                <div className="h-4 w-4 rounded-full border-2 border-slate-600 border-t-cyan-300 animate-spin" />
                {status === 'loading' ? 'Preparing human verification...' : 'Verification in progress...'}
              </div>
            )}

            <div ref={containerRef} className={status === 'ready' || status === 'verifying' ? '' : 'hidden'} />

            {errorMessage && (
              <p className="mt-4 text-sm text-amber-200">{errorMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnstileGate;
