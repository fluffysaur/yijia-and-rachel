alter table invite_groups
  add column if not exists invited_at timestamptz;

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
  )
on conflict (key) do nothing;
