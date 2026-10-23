-- Kana mastery replaces FSRS. Answers stay in review_events; legacy FSRS
-- events remain valid history and are replayed as plain answers.
alter table public.review_events drop constraint review_events_algorithm_check;
alter table public.review_events add constraint review_events_algorithm_check
  check (algorithm in ('fsrs-5.4.2-r90-v1', 'mastery-v1'));

-- Cached progress is derived data: drop the FSRS copies. The sync function
-- recomputes any missing row the next time the account synchronizes.
delete from public.user_card_progress;
alter table public.user_card_progress drop constraint user_card_progress_algorithm_check;
alter table public.user_card_progress add constraint user_card_progress_algorithm_check
  check (algorithm = 'mastery-v1');

-- Same as before, except progress is mastery and its due time lives under `mastery`.
create or replace function public.commit_learning_base(p_user uuid, p_revision bigint, p_events jsonb, p_progress jsonb, p_operations jsonb, p_name text default '') returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare current_revision bigint; item jsonb; stored public.review_events; prior jsonb; entry record; result jsonb; changed boolean := false;
begin
 if p_user is null then raise exception 'Account required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 insert into public.learning_revisions(user_id) values(p_user) on conflict do nothing;
 select revision into current_revision from public.learning_revisions where user_id=p_user;
 if current_revision <> p_revision then raise exception 'revision_conflict' using errcode='40001'; end if;
 insert into public.profiles(user_id,display_name) values(p_user,left(coalesce(p_name,''),200)) on conflict(user_id) do update set display_name = case when public.profiles.display_name = '' then excluded.display_name else public.profiles.display_name end;
 for item in select value from jsonb_array_elements(p_events) loop
  select * into stored from public.review_events where user_id=p_user and id=item->>'id';
  if found then
   if stored.kana_id <> item->>'cardId' or stored.rating <> (item->>'rating')::smallint or stored.reviewed_at <> (item->>'reviewedAt')::timestamptz or stored.device_id <> item->>'deviceId' or stored.algorithm <> item->>'algorithm' then raise exception 'event_conflict'; end if;
  else
   changed := true;
   insert into public.review_events(user_id,id,kana_id,rating,reviewed_at,device_id,algorithm) values(p_user,item->>'id',item->>'cardId',(item->>'rating')::smallint,(item->>'reviewedAt')::timestamptz,item->>'deviceId',item->>'algorithm');
  end if;
 end loop;
 for item in select value from jsonb_array_elements(p_operations) loop
  select payload into prior from public.learning_operations where user_id=p_user and id=item->>'id';
  if found then
   if prior <> item then raise exception 'operation_conflict'; end if;
   continue;
  end if;
  changed := true;
  insert into public.learning_operations(user_id,id,payload) values(p_user,item->>'id',item);
  if coalesce((item->>'onlyIfEmpty')::boolean,false) and exists(select 1 from public.user_preferences where user_id=p_user) then continue; end if;
  if not exists(select 1 from public.user_preferences where user_id=p_user) then
   insert into public.user_preferences(user_id) values(p_user);
   insert into public.user_kana_selection(user_id,kana_id,selected) select p_user,id,id in ('hiragana:あ','hiragana:い','hiragana:う','hiragana:え','hiragana:お') from public.kana_catalog;
  end if;
  update public.user_preferences set theme=coalesce(item->'patch'->>'theme',theme), language=coalesce(item->'patch'->>'language',language), alphabet=coalesce(item->'patch'->>'alphabet',alphabet), updated_at=now() where user_id=p_user;
  for entry in select key,value from jsonb_each(coalesce(item->'patch'->'selection','{}'::jsonb)) loop
   insert into public.user_kana_selection(user_id,kana_id,selected) values(p_user,entry.key,entry.value::boolean) on conflict(user_id,kana_id) do update set selected=excluded.selected,updated_at=now();
  end loop;
 end loop;
 for item in select value from jsonb_array_elements(p_progress) loop
  insert into public.user_card_progress(user_id,kana_id,progress,due,revision,algorithm) values(p_user,item->>'cardId',item,(item->'mastery'->>'due')::timestamptz,current_revision+1,'mastery-v1')
  on conflict(user_id,kana_id) do update set progress=excluded.progress,due=excluded.due,revision=excluded.revision,algorithm=excluded.algorithm,updated_at=now();
 end loop;
 if changed then
  update public.learning_revisions set revision=current_revision+1 where user_id=p_user;
 end if;
 result := public.learning_snapshot(p_user);
 return result || jsonb_build_object('acknowledged',coalesce((select jsonb_agg(value->>'id') from jsonb_array_elements(p_events)),'[]'::jsonb),'acknowledgedOperations',coalesce((select jsonb_agg(value->>'id') from jsonb_array_elements(p_operations)),'[]'::jsonb));
end;
$$;
