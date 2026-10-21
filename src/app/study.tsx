import { Redirect, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { StudySession } from '@/components/study-session';
import { ScheduledStudy } from '@/components/scheduled-study';
import { filterDueSnapshot } from '@/lib/study-progress';
import { parseStudySetup } from '@/lib/study';
import { useLearning } from '@/lib/learning-provider';

export default function StudyScreen() {
  const { document } = useLearning();
  const { kana, families, mode, due } = useLocalSearchParams<{
    kana?: string | string[];
    families?: string | string[];
    mode?: string | string[];
    due?: string | string[];
  }>();
  const cards = useMemo(
    () =>
      filterDueSnapshot(
        parseStudySetup(kana ?? families, kana !== undefined),
        due,
      ),
    [kana, families, due],
  );
  if (!cards.length) return <Redirect href="/practice" />;
  if (mode === 'scheduled')
    return (
      <ScheduledStudy
        dueOnly={due !== undefined}
        key={`scheduled:${document.generation}:${cards.map((card) => card.id).join(',')}`}
        cards={cards}
      />
    );
  return (
    <StudySession key={cards.map((card) => card.id).join(',')} cards={cards} />
  );
}
