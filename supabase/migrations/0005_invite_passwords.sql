alter table invite_groups
  add column invite_password text;

update invite_groups
set invite_password = lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
where invite_password is null;

alter table invite_groups
  alter column invite_password set not null,
  add constraint invite_groups_invite_password_nonempty check (length(trim(invite_password)) > 0),
  add constraint invite_groups_invite_password_unique unique (invite_password);

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
