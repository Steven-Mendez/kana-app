import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const config = JSON.parse(
  execFileSync('node_modules/.bin/supabase', ['status', '--output', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }),
);
assert.equal(
  new URL(config.API_URL).hostname,
  '127.0.0.1',
  'Integration tests must only use local Supabase',
);
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(config.API_URL, config.SERVICE_ROLE_KEY, options);
const users = [];
async function account() {
  const email = `kana-test-${randomUUID()}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  assert.ifError(error);
  users.push(data.user.id);
  const link = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  assert.ifError(link.error);
  const client = createClient(config.API_URL, config.ANON_KEY, options);
  const login = await client.auth.verifyOtp({
    email,
    token: link.data.properties.email_otp,
    type: 'email',
  });
  assert.ifError(login.error);
  return { client, id: data.user.id };
}
async function sync(client, events = [], operations = [], generation = 0) {
  const result = await client.functions.invoke('sync-learning', {
    body: { events, operations, generation },
  });
  if (result.error) {
    const response = result.error.context;
    throw new Error(
      `Sync failed: ${response?.status} ${response ? await response.text() : result.error.message}`,
    );
  }
  return result.data;
}
try {
  const a = await account();
  const b = await account();
  const base = {
    cardId: 'hiragana:あ',
    rating: 3,
    reviewedAt: '2026-01-01T00:00:00.000Z',
    deviceId: 'device-one',
    algorithm: 'fsrs-5.4.2-r90-v1',
  };
  const event = { ...base, id: randomUUID() };
  let result = await sync(
    a.client,
    [event],
    [{ id: 'dark', patch: { theme: 'dark' } }],
  );
  assert.equal(result.events.length, 1);
  const confirmedRevision = result.revision;
  result = await sync(a.client, [event]);
  assert.equal(result.events.length, 1, 'retry must be idempotent');
  assert.equal(result.revision, confirmedRevision, 'retry is a no-op');
  assert.equal(result.preferences.theme, 'dark');
  const other = {
    ...base,
    id: randomUUID(),
    deviceId: 'device-two',
    rating: 1,
  };
  await Promise.all([
    sync(a.client, [other]),
    sync(a.client, [
      { ...base, id: randomUUID(), reviewedAt: '2025-12-31T23:00:00.000Z' },
    ]),
  ]);
  result = await sync(a.client);
  assert.equal(
    result.events.length,
    3,
    'concurrent/out-of-order offline events survive',
  );
  const progress = await a.client
    .from('user_card_progress')
    .select('progress')
    .single();
  assert.ifError(progress.error);
  assert.equal(progress.data.progress.card.reps, 3);
  const foreign = await b.client
    .from('review_events')
    .select('*')
    .eq('user_id', a.id);
  assert.ifError(foreign.error);
  assert.deepEqual(foreign.data, []);
  const forbidden = await b.client.rpc('learning_snapshot', { p_user: a.id });
  assert.ok(forbidden.error, 'snapshot RPC is service-only');
  await assert.rejects(sync(a.client, [{ ...event, rating: 1 }]), /409/);
  await sync(a.client, [], [{ id: 'light', patch: { theme: 'light' } }]);
  result = await sync(a.client, [], [{ id: 'dark', patch: { theme: 'dark' } }]);
  assert.equal(
    result.preferences.theme,
    'light',
    'old retry cannot replace newer settings',
  );
  result = await sync(
    a.client,
    [],
    [{ id: 'import', patch: { theme: 'dark' }, onlyIfEmpty: true }],
  );
  assert.equal(
    result.preferences.theme,
    'light',
    'guest import keeps existing settings',
  );

  const bEvent = { ...base, id: randomUUID() };
  await sync(b.client, [bEvent]);
  const resetId = randomUUID();
  const reset = await a.client.functions.invoke('sync-learning', {
    body: { resetId },
  });
  assert.ifError(reset.error);
  assert.equal(reset.data.generation, 1);
  assert.equal(reset.data.events.length, 0);
  assert.equal(reset.data.preferences.theme, 'light');
  const afterReset = {
    ...base,
    id: randomUUID(),
    reviewedAt: '2026-02-01T00:00:00.000Z',
  };
  await sync(a.client, [afterReset], [], 1);
  const retriedReset = await a.client.functions.invoke('sync-learning', {
    body: { resetId },
  });
  assert.ifError(retriedReset.error);
  assert.equal(
    retriedReset.data.events.length,
    1,
    'lost reset response retry must preserve new progress',
  );
  assert.equal(retriedReset.data.generation, 1);
  const stale = await sync(a.client, [event], [], 0);
  assert.equal(stale.resetRequired, true);
  assert.deepEqual(
    stale.events.map((e) => e.id),
    [afterReset.id],
    'offline pre-reset events cannot resurrect',
  );
  assert.equal(
    (await sync(b.client)).events.length,
    1,
    'reset cannot affect another account',
  );
  const deniedReset = await b.client.rpc('reset_learning', {
    p_user: a.id,
    p_request: 'forbidden',
  });
  assert.ok(deniedReset.error, 'reset RPC must be service-only');
  const staleCommit = await admin.rpc('commit_learning', {
    p_user: a.id,
    p_revision: stale.revision,
    p_generation: 0,
    p_events: [],
    p_progress: [],
    p_operations: [],
  });
  assert.equal(
    staleCommit.error?.code,
    '40001',
    'database fences writes racing with reset',
  );
  const anonymous = createClient(config.API_URL, config.ANON_KEY, options);
  await assert.rejects(sync(anonymous), /401/);
  console.log(
    'PASS: email OTP, authenticated sync, concurrent replay, retries, conflicts, imports, account reset generations and RLS',
  );
} finally {
  for (const id of users) await admin.auth.admin.deleteUser(id);
}
