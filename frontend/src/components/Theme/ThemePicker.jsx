import { useEffect, useState, useRef } from 'react';
import './ThemePicker.css';

/* -------------------------------------------------- utilities */
const getInitial = () => {
  const pref = localStorage.getItem('themePref');        // 'light' | 'dark' | 'system' | null
  if (pref && pref !== 'system') return { theme: pref, pref };  // user picked light/dark

  const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return { theme: systemIsDark ? 'dark' : 'light', pref: pref || 'system' };
};

/* -------------------------------------------------- component */
const ThemePicker = () => {
  const [{ theme, pref }, setState] = useState(getInitial);
  const mqRef = useRef();

  /* body class + storage ------------------------------------ */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('themePref', pref);
  }, [theme, pref]);

  /* follow system if requested ------------------------------- */
  useEffect(() => {
    if (pref !== 'system') return;
    mqRef.current = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = e => setState({ theme: e.matches ? 'dark' : 'light', pref });

    mqRef.current.addEventListener
      ? mqRef.current.addEventListener('change', handler)
      : mqRef.current.addListener(handler);

    return () => {
      mqRef.current.removeEventListener
        ? mqRef.current.removeEventListener('change', handler)
        : mqRef.current.removeListener(handler);
    };
  }, [pref]);

  /* keyboard shortcut T ------------------------------------- */
  useEffect(() => {
    const keyHandler = (e) => e.key.toLowerCase() === 't' && toggle();
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  });

  /* toggle & setters ---------------------------------------- */
  const toggle = () =>
    setState(({ theme }) => ({
      theme: theme === 'dark' ? 'light' : 'dark',
      pref: theme === 'dark' ? 'light' : 'dark',       // becomes explicit choice
    }));

  const setPref = p =>
    setState(({ theme }) => ({
      theme: p === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : p,
      pref: p,
    }));

  /* -------------------------------------------------- render */
  return (
    <>
      {/*   ===== mini dialog for first-time visitors  ===== */}
      {!localStorage.getItem('themePref') && (
        <div className="themePrompt">
          <p>Choose a theme:</p>
          <button onClick={() => setPref('light')}>Light</button>
          <button onClick={() => setPref('dark')}>Dark</button>
          <button onClick={() => setPref('system')}>System</button>
        </div>
      )}

      {/*   ===== tiny switch always visible top-left  ===== */}
      <label className="switch">
        <input type="checkbox" checked={theme === 'light'} onChange={toggle}/>
        <span className="slider">
          <span className="icon">{theme === 'light' ? '🌞' : '🌙'}</span>
        </span>
      </label>
    </>
  );
};

export default ThemePicker;
