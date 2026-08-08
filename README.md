# clay

**Capture today. Close tomorrow.** Clay is a mobile-first field app for capturing off-market properties, construction signs, contacts, photos, GPS data, and follow-up context.

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. In Supabase SQL Editor, run `supabase/migrations/001_initial_schema.sql`. This creates the tables, indexes, Row Level Security policies, private `property-media` bucket, and per-user storage rules.
3. In Supabase Authentication, enable Email authentication. For a private MVP, disable public signups after creating the accounts you need.
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

The first version intentionally leaves deep property research, OCR, enrichment, route tracking, and offline synchronization for later. The capture code is isolated so a durable offline queue can be added without changing the database model.
