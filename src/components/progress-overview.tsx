import { Text, View } from 'react-native';

import { Action } from '@/components/action';
import { usePreferences } from '@/lib/preferences-provider';

/** Progress is loading or failed to load; never shown as zero progress. */
export function ProgressNotice({
  status,
  onRetry,
}: {
  status: 'loading' | 'error';
  onRetry: () => void;
}) {
  const { t } = usePreferences();
  return (
    <View className="items-start gap-3">
      <Text
        accessibilityRole={status === 'error' ? 'alert' : 'progressbar'}
        className="font-ui text-base leading-6 text-muted-foreground"
      >
        {status === 'loading' ? t.loading : t.reviewLoadError}
      </Text>
      {status === 'error' ? (
        <Action variant="quiet" label={t.retry} onPress={onRetry} />
      ) : null}
    </View>
  );
}
