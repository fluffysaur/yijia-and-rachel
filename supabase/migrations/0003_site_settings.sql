create table site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

grant select, insert, update, delete on table site_settings to authenticated;
