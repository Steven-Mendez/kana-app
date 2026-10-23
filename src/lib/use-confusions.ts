import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import {
  createConfusionStore,
  parseConfusions,
  type ConfusionDocument,
} from '@/lib/confusions';
import { useAuth } from '@/lib/auth-provider';
import { learningDb } from '@/lib/learning-db';
import { useLearning } from '@/lib/learning-provider';

const store = createConfusionStore(learningDb);

/**
 * This account's confusions for the current progress generation. Local to the
 * device; a failed read or write never affects studying.
 */
export function useConfusions() {
  const { account } = useAuth();
  const id = account?.id ?? 'guest';
  const { document } = useLearning();
  const generation = document.generation;
  const [doc, setDoc] = useState<ConfusionDocument>(() =>
    parseConfusions(null, generation),
  );
  const active = useRef(false);
  useFocusEffect(
    useCallback(() => {
      active.current = true;
      store.read(id, generation).then(
        (next) => {
          if (active.current) setDoc(next);
        },
        () => {},
      );
      return () => {
        active.current = false;
      };
    }, [id, generation]),
  );
  const record = useCallback(
    (a: string, b: string) => {
      store.record(id, generation, a, b).then(
        (next) => {
          if (active.current) setDoc(next);
        },
        () => {},
      );
    },
    [id, generation],
  );
  // A newer generation (a progress reset) hides what was recorded before.
  return {
    confusions:
      doc.generation === generation ? doc : parseConfusions(null, generation),
    record,
  };
}
