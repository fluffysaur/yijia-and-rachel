grant usage on schema public to service_role;

grant usage on type dinner_meal_option to service_role;

grant select, insert, update, delete on table admin_profiles to service_role;
grant select, insert, update, delete on table invite_groups to service_role;
grant select, insert, update, delete on table rsvp_responses to service_role;
grant select, insert, update, delete on table ceremony_attendees to service_role;
grant select, insert, update, delete on table dinner_attendees to service_role;
grant select, insert, update, delete on table check_ins to service_role;
grant select, insert, update, delete on table rsvp_audit_log to service_role;
grant select, insert, update, delete on table site_settings to service_role;
