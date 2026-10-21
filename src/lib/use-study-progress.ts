import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { cards } from '@/data/kana';
import { useLearning } from '@/lib/learning-provider';
import { summarizeProgress } from '@/lib/study-progress';

type Progress = ReturnType<typeof summarizeProgress>;
type Snapshot =
  | { status: 'loading' | 'error'; data: null }
  | { status: 'ready'; data: Progress };

export function useStudyProgress() {
  const { reviews, document } = useLearning();
  const [snapshot, setSnapshot] = useState<Snapshot>({
    status: 'loading',
    data: null,
  });
  const active = useRef(false);
  const generation = useRef(0);
  const load = useCallback(async () => {
    const current = ++generation.current;
    try {
      const saved = await reviews.load(cards.map((card) => card.id));
      if (active.current && current === generation.current) {
        setSnapshot({
          status: 'ready',
          data: summarizeProgress(saved, new Date()),
        });
      }
    } catch {
      if (active.current && current === generation.current)
        setSnapshot({ status: 'error', data: null });
    }
  }, [reviews]);
  useFocusEffect(
    useCallback(() => {
      active.current = true;
      void load();
      const interval = setInterval(() => {
        void load();
      }, 60_000);
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') void load();
      });
      return () => {
        active.current = false;
        generation.current++;
        clearInterval(interval);
        subscription.remove();
      };
    }, [load]),
  );
  const previousDocument = useRef(document);
  useEffect(() => {
    if (previousDocument.current !== document) {
      previousDocument.current = document;
      if (active.current) void load();
    }
  }, [document, load]);
  return {
    ...snapshot,
    refresh: () => {
      setSnapshot({ status: 'loading', data: null });
      void load();
    },
  };
}
