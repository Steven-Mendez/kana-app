-- A generation fences offline clients after an intentional account reset.
alter table public.learning_revisions add column generation bigint not null default 0 check (generation >= 0);
create table public.learning_reset_requests (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (length(id) between 1 and 200),
  primary key (user_id, id)
);
alter table public.learning_reset_requests enable row level security;
revoke all on public.learning_reset_requests from anon, authenticated;
grant all on public.learning_reset_requests to service_role;

alter function public.learning_snapshot(uuid) rename to learning_snapshot_base;
create function public.learning_snapshot(p_user uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select public.learning_snapshot_base(p_user) || jsonb_build_object(
    'generation', coalesce((select generation from public.learning_revisions where user_id = p_user), 0)
  );
$$;
revoke all on function public.learning_snapshot(uuid) from public, anon, authenticated;
grant execute on function public.learning_snapshot(uuid) to service_role;

alter function public.commit_learning(uuid,bigint,jsonb,jsonb,jsonb,text) rename to commit_learning_base;
create function public.commit_learning(
  p_user uuid, p_revision bigint, p_events jsonb, p_progress jsonb,
  p_operations jsonb, p_name text default '', p_generation bigint default 0
) returns jsonb language plpgsql security invoker set search_path = '' as $$
begin
  if p_user is null then raise exception 'Account required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 0));
  if p_generation is null or p_generation <> coalesce((select generation from public.learning_revisions where user_id = p_user), 0) then
    raise exception 'generation_conflict' using errcode = '40001';
  end if;
  return public.commit_learning_base(p_user, p_revision, p_events, p_progress, p_operations, p_name);
end;
$$;
revoke all on function public.commit_learning(uuid,bigint,jsonb,jsonb,jsonb,text,bigint) from public, anon, authenticated;
grant execute on function public.commit_learning(uuid,bigint,jsonb,jsonb,jsonb,text,bigint) to service_role;

create function public.reset_learning(p_user uuid, p_request text) returns jsonb
language plpgsql security invoker set search_path = '' as $$
begin
  if p_user is null or p_request is null or length(p_request) not between 1 and 200 then
    raise exception 'Invalid reset';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 0));
  if not exists (select 1 from public.learning_reset_requests where user_id = p_user and id = p_request) then
    insert into public.learning_revisions(user_id) values (p_user) on conflict do nothing;
    delete from public.user_card_progress where user_id = p_user;
    delete from public.review_events where user_id = p_user;
    update public.learning_revisions set generation = generation + 1, revision = revision + 1 where user_id = p_user;
    insert into public.learning_reset_requests(user_id, id) values (p_user, p_request);
  end if;
  return public.learning_snapshot(p_user) || jsonb_build_object(
    'acknowledged', '[]'::jsonb, 'acknowledgedOperations', '[]'::jsonb,
    'resetRequired', true, 'acknowledgedReset', p_request
  );
end;
$$;
revoke all on function public.reset_learning(uuid,text) from public, anon, authenticated;
grant execute on function public.reset_learning(uuid,text) to service_role;
