import { beforeEach, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { ResetProgress } from '@/components/reset-progress';
import { copy } from '@/lib/copy';
import { reviews } from '@/lib/reviews';

jest.mock('@/lib/preferences-provider', () => ({
  usePreferences: () => ({
    t: jest.requireActual<typeof import('@/lib/copy')>('@/lib/copy').copy.en,
  }),
}));
jest.mock('@/lib/reviews', () => ({ reviews: { reset: jest.fn() } }));
const t = copy.en;
beforeEach(() => {
  jest.mocked(reviews.reset).mockReset();
});

async function openConfirmation() {
  await fireEvent.press(screen.getByRole('button', { name: t.resetProgress }));
}

test('opening and cancelling confirmation never deletes progress', async () => {
  await render(<ResetProgress />);
  await openConfirmation();
  expect(screen.getByText(t.resetProgressConfirm)).toBeOnTheScreen();
  expect(reviews.reset).not.toHaveBeenCalled();
  await fireEvent.press(
    screen.getByRole('button', { name: t.resetProgressCancel }),
  );
  expect(screen.queryByText(t.resetProgressConfirm)).not.toBeOnTheScreen();
  expect(reviews.reset).not.toHaveBeenCalled();
});

test('confirm runs once and only announces success after deletion completes', async () => {
  let resolve!: () => void;
  jest.mocked(reviews.reset).mockImplementationOnce(
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
  expect(reviews.reset).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('progressbar')).toHaveTextContent(
    t.resetProgressBusy,
  );
  expect(screen.queryByText(t.resetProgressDone)).not.toBeOnTheScreen();
  await act(async () => resolve());
  expect(screen.getByText(t.resetProgressDone)).toBeOnTheScreen();
});

test('failed deletion offers retry without reporting success', async () => {
  jest
    .mocked(reviews.reset)
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
  expect(reviews.reset).toHaveBeenCalledTimes(2);
  expect(screen.getByText(t.resetProgressDone)).toBeOnTheScreen();
});
