import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';

export type InputMode = 'keyboard' | 'touch';

const web = process.env.EXPO_OS === 'web';

function finePointer() {
  return (
    web &&
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(pointer: fine)').matches
  );
}

/**
 * Typing on wide web screens with a mouse, coins everywhere else. A printable
 * key pressed on web switches to typing: a hardware keyboard is right there.
 */
export function useInputMode(): InputMode {
  const { width } = useWindowDimensions();
  const [fine] = useState(finePointer);
  const [typed, setTyped] = useState(false);
  useEffect(() => {
    if (!web || typed || typeof window === 'undefined') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key.length === 1 && !event.metaKey && !event.ctrlKey)
        setTyped(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [typed]);
  if (!web) return 'touch';
  return typed || (fine && width >= 768) ? 'keyboard' : 'touch';
}
