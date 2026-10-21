import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Action } from '@/components/action';
import { usePreferences } from '@/lib/preferences-provider';
import { reviews } from '@/lib/reviews';

export function ResetProgress() {
  const { t } = usePreferences();
  const [status, setStatus] = useState<
    'idle' | 'confirm' | 'pending' | 'done' | 'error'
  >('idle');
  const deleting = useRef(false);
  async function reset() {
    if (deleting.current) return;
    deleting.current = true;
    setStatus('pending');
    try {
      await reviews.reset();
      setStatus('done');
    } catch {
      setStatus('error');
    } finally {
      deleting.current = false;
    }
  }
  return (
    <View className="gap-3 rounded-2xl border border-error bg-surface p-4">
      <Text
        accessibilityRole="header"
        className="text-lg font-semibold text-error"
      >
        {t.resetProgress}
      </Text>
      <Text className="text-sm leading-6 text-muted-foreground">
        {t.resetProgressDetail}
      </Text>
      {status === 'confirm' ? (
        <>
          <Text
            accessibilityLiveRegion="polite"
            className="text-base leading-6 text-foreground"
          >
            {t.resetProgressConfirm}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Action
              label={t.resetProgressCancel}
              onPress={() => setStatus('idle')}
            />
            <Action
              label={t.resetProgressAccept}
              onPress={() => void reset()}
            />
          </View>
        </>
      ) : status === 'pending' ? (
        <Text
          accessibilityRole="progressbar"
          accessibilityLiveRegion="polite"
          className="text-base text-muted-foreground"
        >
          {t.resetProgressBusy}
        </Text>
      ) : status === 'error' ? (
        <>
          <Text accessibilityRole="alert" className="text-base text-error">
            {t.resetProgressError}
          </Text>
          <Action label={t.retry} onPress={() => void reset()} />
        </>
      ) : (
        <>
          {status === 'done' ? (
            <Text
              accessibilityLiveRegion="polite"
              className="text-base text-success"
            >
              {t.resetProgressDone}
            </Text>
          ) : null}
          <View className="items-start">
            <Action
              label={t.resetProgress}
              onPress={() => setStatus('confirm')}
            />
          </View>
        </>
      )}
    </View>
  );
}
