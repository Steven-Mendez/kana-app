import type { LearningEvent, SettingsOperation } from '@/lib/learning-domain';
import type {
  LearningRepository,
  RemoteSnapshot,
} from '@/lib/learning-repository';

export function startSyncLoop(options: {
  repository: LearningRepository;
  account: string;
  synchronize: () => Promise<void>;
  foreground: boolean;
  onStatus: (status: 'local' | 'syncing' | 'synced' | 'attention') => void;
  onSynced: () => void;
}) {
  const { repository, account, synchronize, onStatus, onSynced } = options;
  let active = true;
  let foreground = options.foreground;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let failures = 0;
  let busy = false;
  function schedule(delay: number) {
    clearTimeout(timer);
    if (active && foreground)
      timer = setTimeout(() => {
        void run();
      }, delay);
  }
  async function checkPending() {
    try {
      const doc = await repository.read(account);
      if (
        active &&
        (doc.pending.length || doc.operations.length || doc.resetRequestId)
      ) {
        onStatus('local');
        schedule(0);
      }
    } catch {
      if (active) onStatus('attention');
    }
  }
  async function run() {
    if (!active || !foreground || busy) return;
    busy = true;
    clearTimeout(timer);
    onStatus('syncing');
    try {
      await synchronize();
      if (active) {
        failures = 0;
        onStatus('synced');
        onSynced();
      }
    } catch {
      if (active) {
        onStatus('attention');
        schedule(Math.min(60_000, 2_000 * 2 ** Math.min(failures++, 5)));
      }
    } finally {
      busy = false;
      if (active && failures === 0) await checkPending();
    }
  }
  const unsubscribe = repository.subscribe((changed) => {
    if (changed === account && !busy) void checkPending();
  });
  void run();
  return {
    setForeground(value: boolean) {
      foreground = value;
      if (value) void run();
      else clearTimeout(timer);
    },
    dispose() {
      active = false;
      clearTimeout(timer);
      unsubscribe();
    },
  };
}

export type SyncTransport = (payload: {
  generation: number;
  resetId?: string;
  events: LearningEvent[];
  operations: SettingsOperation[];
}) => Promise<RemoteSnapshot>;

export function createLearningSync(
  repository: LearningRepository,
  account: string,
  transport: SyncTransport,
) {
  let running: Promise<void> | undefined;
  return () => {
    running ??= (async () => {
      if (account === 'guest') return;
      let pending = true;
      while (pending) {
        const doc = await repository.read(account);
        const events = doc.events
          .filter((event) => doc.pending.includes(event.id))
          .slice(0, 100);
        const operations = doc.operations.slice(0, 100);
        const response = await transport({
          generation: doc.generation,
          ...(doc.resetRequestId ? { resetId: doc.resetRequestId } : {}),
          events,
          operations,
        });
        if (
          response.generation < doc.generation ||
          (doc.resetRequestId &&
            response.acknowledgedReset !== doc.resetRequestId)
        )
          throw new Error('Invalid reset acknowledgement');
        if (
          !response.resetRequired &&
          (events.some((event) => !response.acknowledged.includes(event.id)) ||
            operations.some(
              (op) => !response.acknowledgedOperations.includes(op.id),
            ))
        )
          throw new Error('Incomplete acknowledgement');
        await repository.applyRemote(account, response);
        const next = await repository.read(account);
        pending =
          next.pending.length > 0 ||
          next.operations.length > 0 ||
          !!next.resetRequestId;
      }
    })().finally(() => {
      running = undefined;
    });
    return running;
  };
}
