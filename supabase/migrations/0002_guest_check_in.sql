-- Migration 0002: Guest Check-in site settings
insert into site_settings (key, value)
values ('active_check_in_event', 'ceremony')
on conflict (key) do nothing;
