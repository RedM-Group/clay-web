# clay

**Capture today. Close tomorrow.** Clay is a mobile-first field app for capturing off-market properties, construction signs, contacts, photos, GPS data, and follow-up context.

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. In Supabase SQL Editor, run the files in `supabase/migrations/` in numeric order (`001` through `007`). Paste the SQL contents into the editor—not the filename—and run each migration once. These create the tables, indexes, Row Level Security policies, private media bucket, offline/task/drive support, and the expanded Research File.
3. In **Authentication → Providers → Email**, keep email confirmation enabled and disable **Allow new users to sign up**. Clay is invite-only; add users through **Authentication → Users → Invite user**.
4. Create a Mapbox account and a public token with Styles and Geocoding access.
5. Copy `.env.example` to `.env.local` and fill in:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   NEXT_PUBLIC_MAPBOX_TOKEN=YOUR_PUBLIC_MAPBOX_TOKEN
   ```

Never place a Supabase service-role key in a `NEXT_PUBLIC_` variable.

## Run locally

Requires Node.js 20.9+.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Location and camera permissions work on localhost; testing from an iPhone requires an HTTPS deployment.

## Verify

```bash
npm run lint
npm run typecheck
npm run build
```

## Deploy to Vercel

Import the repository in Vercel, add the three environment variables above in Project Settings → Environment Variables, and deploy with the Next.js preset. Add the Vercel production URL to Supabase Authentication → URL Configuration.

## Install on iPhone

Open the deployed HTTPS URL in Safari, tap **Share**, choose **Add to Home Screen**, then tap **Add**. Allow Location and Camera access when Clay asks.

## Data model

All user-owned tables contain `user_id`, and PostgreSQL RLS restricts access to `auth.uid()`. Photos are resized client-side to a maximum 1800px dimension, JPEG-compressed, uploaded to private Storage paths under `users/{user_id}/...`, and represented by metadata rows in PostgreSQL.

Detailed intelligence remains separate from the fast capture record. Property → Research File stores the 31-item progress checklist, intelligence, ownership, contacts, zoning, financials, municipal records, comps, sources, buyer matches, outreach, photo metadata, scores, and topic notes in RLS-protected research tables.

## Expanded Research File

For an existing Clay database, run `supabase/migrations/007_expanded_property_research.sql` after migrations `001`–`006`. It is additive: existing properties, photos, notes, and seven-item checklist completions are retained and migrated into the expanded workspace. The Add Property form is unchanged; detailed research begins only after opening a saved property.

## Invite-only authentication

For an existing database, also run `supabase/migrations/002_invite_only_profiles.sql` in the SQL Editor. Then configure Supabase:

1. **Authentication → URL Configuration**: set Site URL to your deployed Clay URL. Add `http://localhost:3000/**` and your production URL to Redirect URLs.
2. **Authentication → Providers → Email**: disable public signups, require email confirmation, set the minimum password length to at least 12, and enable leaked-password protection if your plan supports it.
3. **Authentication → Users → Invite user**: enter each approved email. The invite link opens Clay, where the user supplies a name, phone number, and strong password.
4. **Authentication → Email Templates**: customize Confirm sign up, Invite user, Magic link/OTP, Change email, Reset password, and Reauthentication. Keep the `{{ .ConfirmationURL }}` link in each authentication template.
5. In the same template area, enable the Password changed, Email changed, Phone changed, sign-in-method, and MFA security notifications you want sent.

Clay enforces 12+ characters with uppercase, lowercase, number, and symbol for new or changed passwords. Supabase should also enforce the minimum length at the project level so the rule applies to every authentication path.

## Offline field capture

Once Clay has been opened online at least once, its installed app shell is cached. If connectivity drops while capturing a property, contact, or construction sign, Clay stores the record and compressed photos in a device-local IndexedDB queue. A status pill above the bottom navigation shows how many captures are waiting. Clay retries automatically when the browser reports that connectivity has returned and every 30 seconds while online.

Offline records use stable client-generated UUIDs, so interrupted retries do not create duplicate properties or contacts. When GPS is unavailable offline, Clay forward-geocodes the saved address during synchronization. Keep the app installed and do not clear Safari website data before queued captures have synchronized.

## Tasks and reminders

For an existing Clay database, run `supabase/migrations/003_tasks_and_reminders.sql` once in the Supabase SQL Editor. Tasks are private to their authenticated owner through RLS and can be linked to either a property or contact. Clay shows open and overdue tasks on Home, supports priorities and completion, and checks due reminders every minute while the app is open. Browser notifications require user permission and HTTPS on iPhone; in-app reminder banners work whenever Clay is open and connected.
