import { useEffect, useState } from 'react';

export default function useDemoStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try { const saved = window.localStorage.getItem(key); return saved ? JSON.parse(saved) : initialValue; }
    catch { return initialValue; }
  });
  useEffect(() => { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* Private browsing may disable storage. */ } }, [key, value]);
  return [value, setValue];
}
