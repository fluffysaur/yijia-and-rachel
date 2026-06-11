create type dinner_meal_option as enum ('Option 1', 'Option 2', 'Halal', 'Vegetarian');

create table admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table invite_groups (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  normalized_name text not null,
  invite_password text not null,
  invited_at timestamptz,
  guest_names text[] not null default '{}',
  dinner_guest_names text[] not null default '{}',
  ceremony_allowed_count integer not null check (ceremony_allowed_count >= 0),
  dinner_allowed_count integer not null default 0 check (dinner_allowed_count >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invite_groups_invite_password_nonempty check (length(trim(invite_password)) > 0),
  constraint invite_groups_invite_password_unique unique (invite_password)
);

create index invite_groups_normalized_name_idx on invite_groups using gin (to_tsvector('simple', normalized_name));

create table rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  invite_group_id uuid not null unique references invite_groups(id) on delete cascade,
  responder_name text not null,
  ceremony_attending_count integer not null check (ceremony_attending_count >= 0),
  dinner_attending_count integer not null check (dinner_attending_count >= 0),
  general_notes text,
  locked_for_guest_edit boolean not null default true,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ceremony_attendees (
  id uuid primary key default gen_random_uuid(),
  rsvp_response_id uuid not null references rsvp_responses(id) on delete cascade,
  attendee_index integer not null check (attendee_index > 0),
  attendee_label text not null,
  dietary_preference text not null default '',
  unique (rsvp_response_id, attendee_index)
);

create table dinner_attendees (
  id uuid primary key default gen_random_uuid(),
  rsvp_response_id uuid not null references rsvp_responses(id) on delete cascade,
  attendee_index integer not null check (attendee_index > 0),
  attendee_label text not null,
  meal_option dinner_meal_option not null,
  dietary_preference text not null default '',
  unique (rsvp_response_id, attendee_index)
);

create table check_ins (
  id uuid primary key default gen_random_uuid(),
  invite_group_id uuid not null references invite_groups(id) on delete cascade,
  event_type text not null check (event_type in ('ceremony', 'dinner')),
  checked_in_count integer not null default 0 check (checked_in_count >= 0),
  checked_in_names text[] not null default '{}',
  checked_in_at timestamptz,
  checked_in_by uuid references auth.users(id),
  unique (invite_group_id, event_type)
);

create table rsvp_audit_log (
  id uuid primary key default gen_random_uuid(),
  invite_group_id uuid references invite_groups(id) on delete set null,
  rsvp_response_id uuid references rsvp_responses(id) on delete set null,
  actor_type text not null check (actor_type in ('guest', 'admin')),
  action text not null,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into site_settings (key, value)
values
  (
    'invite_template_lunch',
    'Dear {groupName}, you are invited to our wedding ceremony and lunch!

{lunchDetails}

Please RSVP on our wedding site by {rsvpDeadline}:
{siteUrl}

Your wedding site password is: {password}

Please reply here if you have any questions.'
  ),
  (
    'invite_template_dinner',
    'Dear {groupName}, you are invited to our wedding ceremony, lunch, and dinner banquet!

{eventDetails}

Please RSVP on our wedding site by {rsvpDeadline}:
{siteUrl}

Your wedding site password is: {password}

Please reply here if you have any questions.'
  );

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_profiles where user_id = auth.uid()
  );
$$;

alter table admin_profiles enable row level security;
alter table invite_groups enable row level security;
alter table rsvp_responses enable row level security;
alter table ceremony_attendees enable row level security;
alter table dinner_attendees enable row level security;
alter table check_ins enable row level security;
alter table rsvp_audit_log enable row level security;
alter table site_settings enable row level security;

create policy "Admins can manage admin profiles" on admin_profiles
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admins can manage invite groups" on invite_groups
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admins can manage RSVP responses" on rsvp_responses
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admins can manage ceremony attendees" on ceremony_attendees
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admins can manage dinner attendees" on dinner_attendees
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admins can manage check ins" on check_ins
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admins can read audit logs" on rsvp_audit_log
  for select to authenticated using (is_admin());

grant usage on schema public to anon, authenticated, service_role;

grant usage on type dinner_meal_option to authenticated, service_role;

grant select, insert, update, delete on table admin_profiles to authenticated, service_role;
grant select, insert, update, delete on table invite_groups to authenticated, service_role;
grant select, insert, update, delete on table rsvp_responses to authenticated, service_role;
grant select, insert, update, delete on table ceremony_attendees to authenticated, service_role;
grant select, insert, update, delete on table dinner_attendees to authenticated, service_role;
grant select, insert, update, delete on table check_ins to authenticated, service_role;
grant select on table rsvp_audit_log to authenticated;
grant select, insert, update, delete on table rsvp_audit_log to service_role;
grant select, insert, update, delete on table site_settings to authenticated, service_role;

create or replace function search_invite_groups(search_text text)
returns table (
  id uuid,
  group_name text,
  guest_names text[],
  dinner_guest_names text[],
  ceremony_allowed_count integer,
  dinner_allowed_count integer,
  notes text,
  has_submitted boolean
)
language sql
security definer
set search_path = public
as $$
  select
    ig.id,
    ig.group_name,
    ig.guest_names,
    ig.dinner_guest_names,
    ig.ceremony_allowed_count,
    ig.dinner_allowed_count,
    null::text as notes,
    exists(select 1 from rsvp_responses rr where rr.invite_group_id = ig.id) as has_submitted
  from invite_groups ig
  where length(trim(search_text)) >= 2
    and ig.normalized_name like '%' || lower(trim(search_text)) || '%'
  order by ig.group_name
  limit 8;
$$;

create or replace function get_public_rsvp(p_invite_group_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_record jsonb;
  response_record jsonb;
  response_id uuid;
  ceremony_records jsonb;
  dinner_records jsonb;
begin
  select to_jsonb(ig.*) - 'invite_password' || jsonb_build_object(
    'has_submitted',
    exists(select 1 from rsvp_responses rr where rr.invite_group_id = ig.id)
  )
  into invite_record
  from invite_groups ig
  where ig.id = p_invite_group_id;

  select rr.id, to_jsonb(rr.*)
  into response_id, response_record
  from rsvp_responses rr
  where rr.invite_group_id = p_invite_group_id;

  select coalesce(jsonb_agg(to_jsonb(ca.*) order by ca.attendee_index), '[]'::jsonb)
  into ceremony_records
  from ceremony_attendees ca
  where ca.rsvp_response_id = response_id;

  select coalesce(jsonb_agg(to_jsonb(da.*) order by da.attendee_index), '[]'::jsonb)
  into dinner_records
  from dinner_attendees da
  where da.rsvp_response_id = response_id;

  return jsonb_build_object(
    'invite_group', invite_record,
    'rsvp_response', response_record,
    'ceremony_attendees', coalesce(ceremony_records, '[]'::jsonb),
    'dinner_attendees', coalesce(dinner_records, '[]'::jsonb)
  );
end;
$$;

create or replace function get_rsvp_settings()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'rsvp_deadline',
    (select value from site_settings where key = 'rsvp_deadline')
  );
$$;

create or replace function submit_guest_rsvp(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_record invite_groups%rowtype;
  response_record rsvp_responses%rowtype;
  existing_response_id uuid;
  ceremony_count integer;
  dinner_count integer;
  deadline_value text;
  row jsonb;
  audit_action text;
begin
  select value into deadline_value from site_settings where key = 'rsvp_deadline';
  if deadline_value is not null and now() >= deadline_value::timestamptz then
    raise exception 'The RSVP deadline has passed. Please contact us for changes.';
  end if;

  select * into invite_record from invite_groups where id = (payload->>'invite_group_id')::uuid;
  if invite_record.id is null then
    raise exception 'Invite group not found';
  end if;

  ceremony_count := (payload->>'ceremony_attending_count')::integer;
  dinner_count := (payload->>'dinner_attending_count')::integer;

  if ceremony_count < 0 or ceremony_count > invite_record.ceremony_allowed_count then
    raise exception 'Invalid church ceremony attendance count';
  end if;

  if dinner_count < 0 or dinner_count > invite_record.dinner_allowed_count then
    raise exception 'Invalid dinner attendance count';
  end if;

  select id into existing_response_id from rsvp_responses where invite_group_id = invite_record.id;
  audit_action := case when existing_response_id is null then 'submitted' else 'updated' end;

  insert into rsvp_responses (
    invite_group_id,
    responder_name,
    ceremony_attending_count,
    dinner_attending_count,
    general_notes,
    locked_for_guest_edit,
    updated_at
  )
  values (
    invite_record.id,
    payload->>'responder_name',
    ceremony_count,
    dinner_count,
    payload->>'general_notes',
    true,
    now()
  )
  on conflict (invite_group_id) do update set
    responder_name = excluded.responder_name,
    ceremony_attending_count = excluded.ceremony_attending_count,
    dinner_attending_count = excluded.dinner_attending_count,
    general_notes = excluded.general_notes,
    locked_for_guest_edit = true,
    updated_at = now()
  returning * into response_record;

  delete from ceremony_attendees where rsvp_response_id = response_record.id;
  delete from dinner_attendees where rsvp_response_id = response_record.id;

  for row in select * from jsonb_array_elements(coalesce(payload->'ceremony_attendees', '[]'::jsonb))
  loop
    insert into ceremony_attendees (
      rsvp_response_id,
      attendee_index,
      attendee_label,
      dietary_preference
    )
    values (
      response_record.id,
      (row->>'attendeeIndex')::integer,
      row->>'attendeeLabel',
      coalesce(row->>'dietaryPreference', '')
    );
  end loop;

  for row in select * from jsonb_array_elements(coalesce(payload->'dinner_attendees', '[]'::jsonb))
  loop
    insert into dinner_attendees (
      rsvp_response_id,
      attendee_index,
      attendee_label,
      meal_option,
      dietary_preference
    )
    values (
      response_record.id,
      (row->>'attendeeIndex')::integer,
      row->>'attendeeLabel',
      (row->>'mealOption')::dinner_meal_option,
      coalesce(row->>'dietaryPreference', '')
    );
  end loop;

  insert into rsvp_audit_log (invite_group_id, rsvp_response_id, actor_type, action, snapshot)
  values (invite_record.id, response_record.id, 'guest', audit_action, payload);

  return get_public_rsvp(invite_record.id)->'rsvp_response';
end;
$$;

grant execute on function search_invite_groups(text) to anon, authenticated;
grant execute on function get_public_rsvp(uuid) to anon, authenticated;
grant execute on function get_rsvp_settings() to anon, authenticated;
grant execute on function submit_guest_rsvp(jsonb) to anon, authenticated;
