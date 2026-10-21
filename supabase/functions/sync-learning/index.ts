import { createClient } from '@supabase/supabase-js';
import {
  mergeEvents,
  replayEvents,
  validatePatch,
  type LearningEvent,
  type SettingsOperation,
} from '../../../src/lib/learning-domain.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS')
    return new Response(null, { headers: cors });
  if (request.method !== 'POST')
    return respond({ error: 'method_not_allowed' }, 405);
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer '))
    return respond({ error: 'unauthorized' }, 401);
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const {
    data: { user },
    error: authError,
  } = await admin.auth.getUser(authorization.slice(7));
  if (authError || !user) return respond({ error: 'unauthorized' }, 401);
  try {
    const text = await request.text();
    if (text.length > 250_000)
      return respond({ error: 'request_too_large' }, 413);
    const payload = JSON.parse(text);
    if (payload.resetId !== undefined) {
      if (
        typeof payload.resetId !== 'string' ||
        !payload.resetId ||
        payload.resetId.length > 200
      )
        return respond({ error: 'invalid_reset' }, 400);
      const { data, error } = await admin.rpc('reset_learning', {
        p_user: user.id,
        p_request: payload.resetId,
      });
      if (error) throw error;
      return respond(data);
    }
    if (
      !Number.isSafeInteger(payload.generation) ||
      payload.generation < 0 ||
      !Array.isArray(payload.events) ||
      !Array.isArray(payload.operations) ||
      payload.events.length > 100 ||
      payload.operations.length > 100
    )
      return respond({ error: 'invalid_batch' }, 400);
    const events = mergeEvents(payload.events as LearningEvent[]);
    const operations = payload.operations as SettingsOperation[];
    const { data: catalog, error: catalogError } = await admin
      .from('kana_catalog')
      .select('id');
    if (catalogError) throw catalogError;
    const ids = new Set<string>(
      catalog!.map((item: { id: string }) => item.id),
    );
    if (
      events.some(
        (event) =>
          !ids.has(event.cardId) ||
          Date.parse(event.reviewedAt) > Date.now() + 300_000,
      )
    )
      return respond({ error: 'invalid_event' }, 400);
    for (const op of operations) {
      if (
        !op ||
        typeof op.id !== 'string' ||
        !op.id ||
        op.id.length > 200 ||
        (op.onlyIfEmpty !== undefined && typeof op.onlyIfEmpty !== 'boolean')
      )
        return respond({ error: 'invalid_operation' }, 400);
      validatePatch(op.patch, ids);
    }
    for (let attempt = 0; attempt < 4; attempt++) {
      const { data: snapshot, error } = await admin.rpc('learning_snapshot', {
        p_user: user.id,
      });
      if (error) throw error;
      if (payload.generation !== snapshot.generation) {
        return respond({
          ...snapshot,
          acknowledged: [],
          acknowledgedOperations: [],
          resetRequired: true,
        });
      }
      const combined = mergeEvents(snapshot.events, events);
      const confirmed = new Set(
        snapshot.events.map((event: LearningEvent) => event.id),
      );
      const changedIds = new Set(
        events
          .filter((event) => !confirmed.has(event.id))
          .map((event) => event.cardId),
      );
      const progress = [...changedIds].map((id) => replayEvents(id, combined));
      const { data, error: commitError } = await admin.rpc('commit_learning', {
        p_user: user.id,
        p_revision: snapshot.revision,
        p_generation: payload.generation,
        p_events: events,
        p_progress: progress,
        p_operations: operations,
        p_name:
          typeof user.user_metadata.full_name === 'string'
            ? user.user_metadata.full_name
            : '',
      });
      if (commitError?.code === '40001') continue;
      if (commitError) {
        if (commitError.message.includes('_conflict'))
          return respond({ error: 'identity_conflict' }, 409);
        throw commitError;
      }
      return respond(data);
    }
    return respond({ error: 'revision_conflict' }, 409);
  } catch (error) {
    if (error instanceof Error && error.message.includes('identity conflict'))
      return respond({ error: 'event_conflict' }, 409);
    if (
      error instanceof SyntaxError ||
      (error instanceof Error && /Invalid/.test(error.message))
    )
      return respond({ error: 'invalid_payload' }, 400);
    // Deliberately exclude payloads, user identifiers, tokens and provider responses.
    console.error('sync-learning failed');
    return respond({ error: 'sync_failed' }, 500);
  }
});
