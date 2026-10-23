import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { StudySession } from '@/components/study-session';
import { ScheduledStudy } from '@/components/scheduled-study';
import { confusedWith } from '@/lib/confusions';
import { useInputMode } from '@/lib/input-mode';
import { filterDueSnapshot } from '@/lib/study-progress';
import { parseStudySetup } from '@/lib/study';
import { useConfusions } from '@/lib/use-confusions';
import { useLearning } from '@/lib/learning-provider';

/** A finite round length from the link, or endless when absent or invalid. */
function parseLength(raw?: string | string[]) {
  const value = Number(typeof raw === 'string' ? raw : undefined);
  return Number.isSafeInteger(value) && value > 0 && value <= 50
    ? value
    : undefined;
}

export default function StudyScreen() {
  const { document } = useLearning();
  const inputMode = useInputMode();
  const { confusions, record } = useConfusions();
  const { kana, families, mode, due, length } = useLocalSearchParams<{
    kana?: string | string[];
    families?: string | string[];
    mode?: string | string[];
    due?: string | string[];
    length?: string | string[];
  }>();
  const cards = useMemo(
    () =>
      filterDueSnapshot(
        parseStudySetup(kana ?? families, kana !== undefined),
        due,
      ),
    [kana, families, due],
  );
  const rounds = parseLength(length);
  const confused = useCallback(
    (cardId: string) => confusedWith(confusions, cardId),
    [confusions],
  );
  if (!cards.length) return <Redirect href="/kana" />;
  if (mode === 'scheduled')
    return (
      <ScheduledStudy
        dueOnly={due !== undefined}
        key={`scheduled:${document.generation}:${cards.map((card) => card.id).join(',')}`}
        cards={cards}
        length={rounds}
        inputMode={inputMode}
        confusedWith={confused}
        onConfusion={record}
      />
    );
  return (
    <StudySession
      key={cards.map((card) => card.id).join(',')}
      cards={cards}
      length={rounds}
      inputMode={inputMode}
      confusedWith={confused}
      onConfusion={record}
    />
  );
}
