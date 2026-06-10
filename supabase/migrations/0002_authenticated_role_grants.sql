grant usage on schema public to anon, authenticated;

grant usage on type dinner_meal_option to authenticated;

grant select, insert, update, delete on table admin_profiles to authenticated;
grant select, insert, update, delete on table invite_groups to authenticated;
grant select, insert, update, delete on table rsvp_responses to authenticated;
grant select, insert, update, delete on table ceremony_attendees to authenticated;
grant select, insert, update, delete on table dinner_attendees to authenticated;
grant select, insert, update, delete on table check_ins to authenticated;
grant select on table rsvp_audit_log to authenticated;
