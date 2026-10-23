/**
 * Generates the game sound effects in assets/sounds.
 *
 * Every clip is synthesized here from bell-like tones and filtered noise, so
 * the sounds are original and carry no third-party license. Notes come from
 * the C major pentatonic scale so any two clips sound good back to back. The
 * output is deterministic: 22.05 kHz, mono, 16-bit WAV.
 *
 * Usage: node scripts/generate-game-sounds.mjs
 */
import { Buffer } from 'node:buffer';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'assets/sounds');
const rate = 22050;

const hz = (note) => 440 * 2 ** ((note - 69) / 12);
// MIDI note numbers.
const C4 = 60,
  E4 = 64,
  A4 = 69,
  C5 = 72,
  E5 = 76,
  G5 = 79;
const A5 = 81,
  C6 = 84,
  D6 = 86,
  E6 = 88,
  G6 = 91,
  C7 = 96;

function clip(seconds) {
  return new Float32Array(Math.ceil(seconds * rate));
}

/** A bell-ish tone: a few decaying partials with a short attack. */
function tone(
  buffer,
  note,
  start,
  length,
  { gain = 0.5, decay = 6, partials = [1, 0.35, 0.12], wave = 'sine' } = {},
) {
  const freq = hz(note);
  const from = Math.floor(start * rate);
  const count = Math.floor(length * rate);
  const attack = Math.floor(0.004 * rate);
  for (let i = 0; i < count && from + i < buffer.length; i++) {
    const t = i / rate;
    const envelope =
      Math.min(1, i / attack) *
      Math.exp(-decay * t) *
      // Fade the tail so a cut never clicks.
      Math.min(1, (count - i) / (0.01 * rate));
    let sample = 0;
    partials.forEach((amount, index) => {
      const phase = 2 * Math.PI * freq * (index + 1) * t;
      sample +=
        amount *
        (wave === 'triangle'
          ? (2 / Math.PI) * Math.asin(Math.sin(phase))
          : Math.sin(phase));
    });
    buffer[from + i] += gain * envelope * sample;
  }
}

/** Low-passed noise whose cutoff sweeps upward: a soft "whoosh". */
function whoosh(buffer, start, length, { gain = 0.35 } = {}) {
  let seed = 7;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 1073741824 - 1;
  };
  const from = Math.floor(start * rate);
  const count = Math.floor(length * rate);
  let low = 0;
  for (let i = 0; i < count && from + i < buffer.length; i++) {
    const progress = i / count;
    const cutoff = 300 + 3500 * progress ** 2;
    const alpha = 1 - Math.exp((-2 * Math.PI * cutoff) / rate);
    low += alpha * (random() - low);
    const envelope = Math.sin(Math.PI * progress) ** 1.5;
    buffer[from + i] += gain * envelope * low;
  }
}

function wav(buffer) {
  let peak = 0;
  for (const sample of buffer) peak = Math.max(peak, Math.abs(sample));
  // Normalize every clip to the same -3 dBFS peak.
  const scale = peak ? 0.708 / peak : 0;
  const data = Buffer.alloc(buffer.length * 2);
  buffer.forEach((sample, index) => {
    data.writeInt16LE(Math.round(sample * scale * 32767), index * 2);
  });
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const sounds = {
  // Two quick rising notes: the classic "ding-ding".
  correct() {
    const buffer = clip(0.42);
    tone(buffer, C6, 0, 0.12, { gain: 0.45, decay: 14 });
    tone(buffer, G6, 0.075, 0.34, { gain: 0.55, decay: 9 });
    return buffer;
  },
  // A soft, low falling pair: noticeable without scolding.
  wrong() {
    const buffer = clip(0.4);
    const soft = { wave: 'triangle', partials: [1, 0.2], decay: 8 };
    tone(buffer, E4, 0, 0.16, { ...soft, gain: 0.5 });
    tone(buffer, C4, 0.11, 0.29, { ...soft, gain: 0.55 });
    return buffer;
  },
  // A sparkling run up the scale when a kitsunebi lights.
  combo() {
    const buffer = clip(0.62);
    [C6, D6, E6, G6].forEach((note, index) =>
      tone(buffer, note, index * 0.055, 0.2, { gain: 0.4, decay: 12 }),
    );
    tone(buffer, C7, 0.22, 0.4, { gain: 0.45, decay: 7 });
    tone(buffer, G6, 0.22, 0.4, { gain: 0.2, decay: 7 });
    return buffer;
  },
  // Round finished: a short arpeggio that lands on a held chord.
  complete() {
    const buffer = clip(1.15);
    [C5, E5, G5].forEach((note, index) =>
      tone(buffer, note, index * 0.1, 0.25, { gain: 0.4, decay: 8 }),
    );
    [C5, E5, G5, C6].forEach((note) =>
      tone(buffer, note, 0.3, 0.85, { gain: 0.25, decay: 3.2 }),
    );
    return buffer;
  },
  // Perfect round: a higher, longer fanfare with a shimmer on top.
  perfect() {
    const buffer = clip(1.5);
    [C5, E5, G5, C6, E6].forEach((note, index) =>
      tone(buffer, note, index * 0.085, 0.24, { gain: 0.38, decay: 9 }),
    );
    [C5, G5, C6, E6, G6].forEach((note) =>
      tone(buffer, note, 0.43, 1.05, { gain: 0.22, decay: 2.6 }),
    );
    [C7, G6, C7].forEach((note, index) =>
      tone(buffer, note, 0.55 + index * 0.12, 0.3, { gain: 0.14, decay: 10 }),
    );
    return buffer;
  },
  // The streak flame igniting: a whoosh that blooms into a warm chime.
  streak() {
    const buffer = clip(0.95);
    whoosh(buffer, 0, 0.38, { gain: 0.5 });
    tone(buffer, G5, 0.24, 0.3, { gain: 0.4, decay: 9 });
    tone(buffer, D6, 0.32, 0.6, { gain: 0.45, decay: 5 });
    tone(buffer, A5, 0.32, 0.6, { gain: 0.2, decay: 5 });
    tone(buffer, A4, 0.32, 0.6, { gain: 0.15, decay: 5 });
    return buffer;
  },
};

await mkdir(out, { recursive: true });
for (const [name, render] of Object.entries(sounds)) {
  const file = join(out, `${name}.wav`);
  await writeFile(file, wav(render()));
  console.log(`assets/sounds/${name}.wav`);
}
