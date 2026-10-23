import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Action } from '@/components/action';
import { Section, TextAction } from '@/components/game/layout';
import { answerHaptic } from '@/lib/haptics';
import { usePreferences } from '@/lib/preferences-provider';
import { useLearning } from '@/lib/learning-provider';
import { useAuth } from '@/lib/auth-provider';

export function ResetProgress() {
  const { t } = usePreferences();
  const { resetProgress } = useLearning();
  const { account } = useAuth();
  const [status, setStatus] = useState<
    'idle' | 'confirm' | 'pending' | 'done' | 'error'
  >('idle');
  const deleting = useRef(false);
  async function reset() {
    if (deleting.current) return;
    deleting.current = true;
    setStatus('pending');
    try {
      await resetProgress();
      answerHaptic(true);
      setStatus('done');
    } catch {
      setStatus('error');
    } finally {
      deleting.current = false;
    }
  }
  return (
    <Section label={t.resetProgress}>
      <Text className="font-ui text-[13px] leading-5 text-muted-foreground">
        {account ? t.resetAccountProgressDetail : t.resetProgressDetail}
      </Text>
      {status === 'confirm' ? (
        <>
          <Text
            accessibilityLiveRegion="polite"
            className="font-ui text-base leading-6 text-foreground"
          >
            {account ? t.resetAccountProgressConfirm : t.resetProgressConfirm}
          </Text>
          <View className="flex-row flex-wrap items-center gap-4">
            <Action
              variant="destructive"
              label={t.resetProgressAccept}
              onPress={() => void reset()}
            />
            <TextAction
              tone="muted"
              label={t.resetProgressCancel}
              onPress={() => setStatus('idle')}
            />
          </View>
        </>
      ) : status === 'pending' ? (
        <Text
          accessibilityRole="progressbar"
          accessibilityLiveRegion="polite"
          className="font-ui text-[15px] text-muted-foreground"
        >
          {t.resetProgressBusy}
        </Text>
      ) : status === 'error' ? (
        <>
          <Text
            accessibilityRole="alert"
            className="font-ui text-[15px] text-error"
          >
            {t.resetProgressError}
          </Text>
          <View className="items-start">
            <Action
              variant="quiet"
              label={t.retry}
              onPress={() => void reset()}
            />
          </View>
        </>
      ) : (
        <>
          {status === 'done' ? (
            <Text
              accessibilityLiveRegion="polite"
              className="font-ui text-[15px] text-success"
            >
              {t.resetProgressDone}
            </Text>
          ) : null}
          <View className="items-start">
            <Action
              variant="quiet"
              label={t.resetProgress}
              onPress={() => setStatus('confirm')}
            />
          </View>
        </>
      )}
    </Section>
  );
}
