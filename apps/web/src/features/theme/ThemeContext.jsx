import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const choices = ['light', 'dark', 'system'];

function storedChoice() {
  try { const value = localStorage.getItem('theme'); return choices.includes(value) ? value : 'system'; }
  catch { return 'system'; }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(storedChoice);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
      document.documentElement.style.colorScheme = document.documentElement.dataset.theme;
    };
    apply();
    if (theme === 'system') media.addEventListener('change', apply);
    try { localStorage.setItem('theme', theme); } catch { /* storage unavailable */ }
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('ThemeProvider missing');
  return value;
}
