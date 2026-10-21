import { beforeEach, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { ResetProgress } from '@/components/reset-progress';
import { copy } from '@/lib/copy';
import { useLearning } from '@/lib/learning-provider';
import { useAuth } from '@/lib/auth-provider';

jest.mock('@/lib/preferences-provider', () => ({
  usePreferences: () => ({
    t: jest.requireActual<typeof import('@/lib/copy')>('@/lib/copy').copy.en,
  }),
}));
jest.mock('@/lib/learning-provider', () => ({ useLearning: jest.fn() }));
jest.mock('@/lib/auth-provider', () => ({ useAuth: jest.fn() }));
const resetProgress = jest.fn<() => Promise<void>>();
const t = copy.en;
beforeEach(() => {
  resetProgress.mockReset();
  jest.mocked(useLearning).mockReturnValue({ resetProgress } as never);
  jest.mocked(useAuth).mockReturnValue({ account: null } as never);
});

async function openConfirmation() {
  await fireEvent.press(screen.getByRole('button', { name: t.resetProgress }));
}

test('opening and cancelling confirmation never deletes progress', async () => {
  await render(<ResetProgress />);
  await openConfirmation();
  expect(screen.getByText(t.resetProgressConfirm)).toBeOnTheScreen();
  expect(resetProgress).not.toHaveBeenCalled();
  await fireEvent.press(
    screen.getByRole('button', { name: t.resetProgressCancel }),
  );
  expect(screen.queryByText(t.resetProgressConfirm)).not.toBeOnTheScreen();
  expect(resetProgress).not.toHaveBeenCalled();
});

test('confirm runs once and only announces success after deletion completes', async () => {
  let resolve!: () => void;
  jest.mocked(resetProgress).mockImplementationOnce(
    () =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  );
  await render(<ResetProgress />);
  await openConfirmation();
  await fireEvent.press(
    screen.getByRole('button', { name: t.resetProgressAccept }),
  );
  expect(
    screen.queryByRole('button', { name: t.resetProgressAccept }),
  ).not.toBeOnTheScreen();
  expect(resetProgress).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('progressbar')).toHaveTextContent(
    t.resetProgressBusy,
  );
  expect(screen.queryByText(t.resetProgressDone)).not.toBeOnTheScreen();
  await act(async () => resolve());
  expect(screen.getByText(t.resetProgressDone)).toBeOnTheScreen();
});

test('failed deletion offers retry without reporting success', async () => {
  jest
    .mocked(resetProgress)
    .mockRejectedValueOnce(new Error('unavailable'))
    .mockResolvedValueOnce(undefined);
  await render(<ResetProgress />);
  await openConfirmation();
  await fireEvent.press(
    screen.getByRole('button', { name: t.resetProgressAccept }),
  );
  expect(screen.getByRole('alert')).toHaveTextContent(t.resetProgressError);
  expect(screen.queryByText(t.resetProgressDone)).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: t.retry }));
  expect(resetProgress).toHaveBeenCalledTimes(2);
  expect(screen.getByText(t.resetProgressDone)).toBeOnTheScreen();
});

test('account reset confirmation describes every device and invokes the active repository', async () => {
  jest.mocked(useAuth).mockReturnValue({ account: { id: 'alice' } } as never);
  resetProgress.mockResolvedValueOnce(undefined);
  await render(<ResetProgress />);
  expect(screen.getByText(t.resetAccountProgressDetail)).toBeOnTheScreen();
  await openConfirmation();
  expect(screen.getByText(t.resetAccountProgressConfirm)).toBeOnTheScreen();
  await fireEvent.press(
    screen.getByRole('button', { name: t.resetProgressAccept }),
  );
  expect(resetProgress).toHaveBeenCalledTimes(1);
});
