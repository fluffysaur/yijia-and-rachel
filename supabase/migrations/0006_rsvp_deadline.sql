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

grant execute on function get_rsvp_settings() to anon, authenticated;
grant execute on function submit_guest_rsvp(jsonb) to anon, authenticated;
