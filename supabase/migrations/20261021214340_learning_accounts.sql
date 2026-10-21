create table public.kana_catalog (id text primary key, alphabet text not null check (alphabet in ('hiragana','katakana')));
create table public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '', timezone text not null default 'UTC',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 theme text not null default 'light' check(theme in ('light','dark')),
 language text not null default 'es' check(language in ('es','en')),
 alphabet text not null default 'hiragana' check(alphabet in ('hiragana','katakana')),
 updated_at timestamptz not null default now()
);
create table public.user_kana_selection (
 user_id uuid references auth.users(id) on delete cascade, kana_id text references public.kana_catalog(id),
 selected boolean not null, updated_at timestamptz not null default now(), primary key(user_id,kana_id)
);
create table public.review_events (
 user_id uuid references auth.users(id) on delete cascade, id text check(length(id) between 1 and 200),
 kana_id text not null references public.kana_catalog(id), rating smallint not null check(rating between 1 and 4),
 reviewed_at timestamptz not null, device_id text not null check(length(device_id) between 1 and 100),
 algorithm text not null check(algorithm = 'fsrs-5.4.2-r90-v1'), created_at timestamptz not null default now(),
 primary key(user_id,id)
);
create index review_history on public.review_events(user_id,kana_id,reviewed_at,id);
create table public.user_card_progress (
 user_id uuid references auth.users(id) on delete cascade, kana_id text references public.kana_catalog(id),
 progress jsonb not null, due timestamptz not null, revision bigint not null check(revision >= 0),
 algorithm text not null check(algorithm = 'fsrs-5.4.2-r90-v1'), updated_at timestamptz not null default now(),
 primary key(user_id,kana_id)
);
create index due_cards on public.user_card_progress(user_id,due);
-- Internal idempotency and revision records are never exposed to end users.
create table public.learning_revisions (user_id uuid primary key references auth.users(id) on delete cascade, revision bigint not null default 0);
create table public.learning_operations (user_id uuid references auth.users(id) on delete cascade, id text, payload jsonb not null, primary key(user_id,id));

alter table public.kana_catalog enable row level security;
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_kana_selection enable row level security;
alter table public.review_events enable row level security;
alter table public.user_card_progress enable row level security;
alter table public.learning_revisions enable row level security;
alter table public.learning_operations enable row level security;
revoke all on public.kana_catalog, public.profiles, public.user_preferences, public.user_kana_selection, public.review_events, public.user_card_progress, public.learning_revisions, public.learning_operations from anon, authenticated;
grant select on public.kana_catalog to anon, authenticated;
grant select on public.profiles, public.user_preferences, public.user_kana_selection, public.review_events, public.user_card_progress to authenticated;
grant update(display_name, timezone, updated_at) on public.profiles to authenticated;
grant all on public.kana_catalog, public.profiles, public.user_preferences, public.user_kana_selection, public.review_events, public.user_card_progress, public.learning_revisions, public.learning_operations to service_role;
create policy catalog_read on public.kana_catalog for select to anon, authenticated using(true);
create policy own_profile on public.profiles for select to authenticated using((select auth.uid()) = user_id);
create policy edit_profile on public.profiles for update to authenticated using((select auth.uid()) = user_id) with check((select auth.uid()) = user_id);
create policy own_preferences on public.user_preferences for select to authenticated using((select auth.uid()) = user_id);
create policy own_selection on public.user_kana_selection for select to authenticated using((select auth.uid()) = user_id);
create policy own_events on public.review_events for select to authenticated using((select auth.uid()) = user_id);
create policy own_progress on public.user_card_progress for select to authenticated using((select auth.uid()) = user_id);

create function public.learning_snapshot(p_user uuid) returns jsonb language sql stable security invoker set search_path = '' as $$
 select jsonb_build_object(
  'revision', coalesce((select revision from public.learning_revisions where user_id=p_user),0),
  'progress', coalesce((select jsonb_object_agg(kana_id,progress) from public.user_card_progress where user_id=p_user),'{}'::jsonb),
  'revisions', coalesce((select jsonb_object_agg(kana_id,revision) from public.user_card_progress where user_id=p_user),'{}'::jsonb),
  'events', coalesce((select jsonb_agg(jsonb_build_object('id',id,'cardId',kana_id,'rating',rating,'reviewedAt',to_char(reviewed_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'deviceId',device_id,'algorithm',algorithm) order by reviewed_at,id) from public.review_events where user_id=p_user),'[]'::jsonb),
  'preferences', coalesce((select jsonb_build_object('theme',theme,'language',language) from public.user_preferences where user_id=p_user),'{"theme":"light","language":"es"}'::jsonb),
  'selection', jsonb_build_object('alphabet',coalesce((select alphabet from public.user_preferences where user_id=p_user),'hiragana'), 'kanaIds',case when exists(select 1 from public.user_preferences where user_id=p_user) then coalesce((select jsonb_agg(kana_id order by kana_id) from public.user_kana_selection where user_id=p_user and selected),'[]'::jsonb) else '["hiragana:あ","hiragana:い","hiragana:う","hiragana:え","hiragana:お"]'::jsonb end),
  'hasSettings', exists(select 1 from public.user_preferences where user_id=p_user)
 );
$$;
revoke all on function public.learning_snapshot(uuid) from public, anon, authenticated;
grant execute on function public.learning_snapshot(uuid) to service_role;

create function public.commit_learning(p_user uuid, p_revision bigint, p_events jsonb, p_progress jsonb, p_operations jsonb, p_name text default '') returns jsonb
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
  insert into public.user_card_progress(user_id,kana_id,progress,due,revision,algorithm) values(p_user,item->>'cardId',item,(item->'card'->>'due')::timestamptz,current_revision+1,'fsrs-5.4.2-r90-v1')
  on conflict(user_id,kana_id) do update set progress=excluded.progress,due=excluded.due,revision=excluded.revision,updated_at=now();
 end loop;
 if changed then
  update public.learning_revisions set revision=current_revision+1 where user_id=p_user;
 end if;
 result := public.learning_snapshot(p_user);
 return result || jsonb_build_object('acknowledged',coalesce((select jsonb_agg(value->>'id') from jsonb_array_elements(p_events)),'[]'::jsonb),'acknowledgedOperations',coalesce((select jsonb_agg(value->>'id') from jsonb_array_elements(p_operations)),'[]'::jsonb));
end;
$$;
revoke all on function public.commit_learning(uuid,bigint,jsonb,jsonb,jsonb,text) from public, anon, authenticated;
grant execute on function public.commit_learning(uuid,bigint,jsonb,jsonb,jsonb,text) to service_role;

-- Generated from src/data/kana.ts.
insert into public.kana_catalog(id,alphabet) values
('hiragana:あ','hiragana'),
('hiragana:い','hiragana'),
('hiragana:う','hiragana'),
('hiragana:え','hiragana'),
('hiragana:お','hiragana'),
('hiragana:か','hiragana'),
('hiragana:き','hiragana'),
('hiragana:く','hiragana'),
('hiragana:け','hiragana'),
('hiragana:こ','hiragana'),
('hiragana:さ','hiragana'),
('hiragana:し','hiragana'),
('hiragana:す','hiragana'),
('hiragana:せ','hiragana'),
('hiragana:そ','hiragana'),
('hiragana:た','hiragana'),
('hiragana:ち','hiragana'),
('hiragana:つ','hiragana'),
('hiragana:て','hiragana'),
('hiragana:と','hiragana'),
('hiragana:な','hiragana'),
('hiragana:に','hiragana'),
('hiragana:ぬ','hiragana'),
('hiragana:ね','hiragana'),
('hiragana:の','hiragana'),
('hiragana:は','hiragana'),
('hiragana:ひ','hiragana'),
('hiragana:ふ','hiragana'),
('hiragana:へ','hiragana'),
('hiragana:ほ','hiragana'),
('hiragana:ま','hiragana'),
('hiragana:み','hiragana'),
('hiragana:む','hiragana'),
('hiragana:め','hiragana'),
('hiragana:も','hiragana'),
('hiragana:や','hiragana'),
('hiragana:ゆ','hiragana'),
('hiragana:よ','hiragana'),
('hiragana:ら','hiragana'),
('hiragana:り','hiragana'),
('hiragana:る','hiragana'),
('hiragana:れ','hiragana'),
('hiragana:ろ','hiragana'),
('hiragana:わ','hiragana'),
('hiragana:を','hiragana'),
('hiragana:ん','hiragana'),
('hiragana:が','hiragana'),
('hiragana:ぎ','hiragana'),
('hiragana:ぐ','hiragana'),
('hiragana:げ','hiragana'),
('hiragana:ご','hiragana'),
('hiragana:ざ','hiragana'),
('hiragana:じ','hiragana'),
('hiragana:ず','hiragana'),
('hiragana:ぜ','hiragana'),
('hiragana:ぞ','hiragana'),
('hiragana:だ','hiragana'),
('hiragana:ぢ','hiragana'),
('hiragana:づ','hiragana'),
('hiragana:で','hiragana'),
('hiragana:ど','hiragana'),
('hiragana:ば','hiragana'),
('hiragana:び','hiragana'),
('hiragana:ぶ','hiragana'),
('hiragana:べ','hiragana'),
('hiragana:ぼ','hiragana'),
('hiragana:ぱ','hiragana'),
('hiragana:ぴ','hiragana'),
('hiragana:ぷ','hiragana'),
('hiragana:ぺ','hiragana'),
('hiragana:ぽ','hiragana'),
('hiragana:きゃ','hiragana'),
('hiragana:きゅ','hiragana'),
('hiragana:きょ','hiragana'),
('hiragana:しゃ','hiragana'),
('hiragana:しゅ','hiragana'),
('hiragana:しょ','hiragana'),
('hiragana:ちゃ','hiragana'),
('hiragana:ちゅ','hiragana'),
('hiragana:ちょ','hiragana'),
('hiragana:にゃ','hiragana'),
('hiragana:にゅ','hiragana'),
('hiragana:にょ','hiragana'),
('hiragana:ひゃ','hiragana'),
('hiragana:ひゅ','hiragana'),
('hiragana:ひょ','hiragana'),
('hiragana:みゃ','hiragana'),
('hiragana:みゅ','hiragana'),
('hiragana:みょ','hiragana'),
('hiragana:りゃ','hiragana'),
('hiragana:りゅ','hiragana'),
('hiragana:りょ','hiragana'),
('hiragana:ぎゃ','hiragana'),
('hiragana:ぎゅ','hiragana'),
('hiragana:ぎょ','hiragana'),
('hiragana:じゃ','hiragana'),
('hiragana:じゅ','hiragana'),
('hiragana:じょ','hiragana'),
('hiragana:ぢゃ','hiragana'),
('hiragana:ぢゅ','hiragana'),
('hiragana:ぢょ','hiragana'),
('hiragana:びゃ','hiragana'),
('hiragana:びゅ','hiragana'),
('hiragana:びょ','hiragana'),
('hiragana:ぴゃ','hiragana'),
('hiragana:ぴゅ','hiragana'),
('hiragana:ぴょ','hiragana'),
('katakana:ア','katakana'),
('katakana:イ','katakana'),
('katakana:ウ','katakana'),
('katakana:エ','katakana'),
('katakana:オ','katakana'),
('katakana:カ','katakana'),
('katakana:キ','katakana'),
('katakana:ク','katakana'),
('katakana:ケ','katakana'),
('katakana:コ','katakana'),
('katakana:サ','katakana'),
('katakana:シ','katakana'),
('katakana:ス','katakana'),
('katakana:セ','katakana'),
('katakana:ソ','katakana'),
('katakana:タ','katakana'),
('katakana:チ','katakana'),
('katakana:ツ','katakana'),
('katakana:テ','katakana'),
('katakana:ト','katakana'),
('katakana:ナ','katakana'),
('katakana:ニ','katakana'),
('katakana:ヌ','katakana'),
('katakana:ネ','katakana'),
('katakana:ノ','katakana'),
('katakana:ハ','katakana'),
('katakana:ヒ','katakana'),
('katakana:フ','katakana'),
('katakana:ヘ','katakana'),
('katakana:ホ','katakana'),
('katakana:マ','katakana'),
('katakana:ミ','katakana'),
('katakana:ム','katakana'),
('katakana:メ','katakana'),
('katakana:モ','katakana'),
('katakana:ヤ','katakana'),
('katakana:ユ','katakana'),
('katakana:ヨ','katakana'),
('katakana:ラ','katakana'),
('katakana:リ','katakana'),
('katakana:ル','katakana'),
('katakana:レ','katakana'),
('katakana:ロ','katakana'),
('katakana:ワ','katakana'),
('katakana:ヲ','katakana'),
('katakana:ン','katakana'),
('katakana:ガ','katakana'),
('katakana:ギ','katakana'),
('katakana:グ','katakana'),
('katakana:ゲ','katakana'),
('katakana:ゴ','katakana'),
('katakana:ザ','katakana'),
('katakana:ジ','katakana'),
('katakana:ズ','katakana'),
('katakana:ゼ','katakana'),
('katakana:ゾ','katakana'),
('katakana:ダ','katakana'),
('katakana:ヂ','katakana'),
('katakana:ヅ','katakana'),
('katakana:デ','katakana'),
('katakana:ド','katakana'),
('katakana:バ','katakana'),
('katakana:ビ','katakana'),
('katakana:ブ','katakana'),
('katakana:ベ','katakana'),
('katakana:ボ','katakana'),
('katakana:パ','katakana'),
('katakana:ピ','katakana'),
('katakana:プ','katakana'),
('katakana:ペ','katakana'),
('katakana:ポ','katakana'),
('katakana:キャ','katakana'),
('katakana:キュ','katakana'),
('katakana:キョ','katakana'),
('katakana:シャ','katakana'),
('katakana:シュ','katakana'),
('katakana:ショ','katakana'),
('katakana:チャ','katakana'),
('katakana:チュ','katakana'),
('katakana:チョ','katakana'),
('katakana:ニャ','katakana'),
('katakana:ニュ','katakana'),
('katakana:ニョ','katakana'),
('katakana:ヒャ','katakana'),
('katakana:ヒュ','katakana'),
('katakana:ヒョ','katakana'),
('katakana:ミャ','katakana'),
('katakana:ミュ','katakana'),
('katakana:ミョ','katakana'),
('katakana:リャ','katakana'),
('katakana:リュ','katakana'),
('katakana:リョ','katakana'),
('katakana:ギャ','katakana'),
('katakana:ギュ','katakana'),
('katakana:ギョ','katakana'),
('katakana:ジャ','katakana'),
('katakana:ジュ','katakana'),
('katakana:ジョ','katakana'),
('katakana:ヂャ','katakana'),
('katakana:ヂュ','katakana'),
('katakana:ヂョ','katakana'),
('katakana:ビャ','katakana'),
('katakana:ビュ','katakana'),
('katakana:ビョ','katakana'),
('katakana:ピャ','katakana'),
('katakana:ピュ','katakana'),
('katakana:ピョ','katakana');
