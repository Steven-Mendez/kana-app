/** Kitsunebi at the head of the progress fill: one per three answers in a row, up to three. */
export const kitsunebiCount = (combo: number) =>
  Math.min(3, Math.floor(Math.max(0, combo) / 3));
