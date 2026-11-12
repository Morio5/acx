/*
# KHMER COMIC AI - Phase 1: Profiles Table, Storage Buckets, and Security

## Overview
This migration sets up the foundational database schema for KHMER COMIC AI.
It creates a user profiles table, two private storage buckets for comic uploads
and processed output, and all the row-level security policies needed for a
multi-user application where each user can only access their own data.

## New Tables

### `profiles`
- `id` (uuid, primary key) — references `auth.users(id)` with CASCADE delete.
  This is the same ID as the authenticated user, so there is a 1:1 relationship.
- `display_name` (text, not null) — the user's chosen display name.
- `default_source_language` (text, not null, default 'japanese') — the user's
  preferred source language. One of: 'chinese', 'korean', 'japanese', 'english'.
- `preferred_khmer_font` (text, not null, default 'noto-sans-khmer') — the
  user's preferred Khmer font for rendering. One of: 'noto-sans-khmer',
  'battambang', 'nimbus-mono-khmer'.
- `avatar_url` (text, nullable) — optional URL to the user's avatar in storage.
- `created_at` (timestamptz, default now()).
- `updated_at` (timestamptz, default now()).

## New Functions

### `handle_new_user()`
A trigger function that automatically creates a profile row when a new user
signs up. It extracts the display name from the user's metadata if provided,
otherwise defaults to the email username. This ensures every authenticated
user has a profile row without the frontend needing to create one manually.

### `update_updated_at_column()`
A trigger function that automatically sets `updated_at` to `now()` on any
UPDATE to the profiles table.

## Triggers
- `on_auth_user_created` — fires AFTER INSERT on `auth.users`, calls
  `handle_new_user()` to auto-create a profile.
- `profiles_updated_at` — fires BEFORE UPDATE on `profiles`, calls
  `update_updated_at_column()`.

## Storage Buckets
- `source-uploads` (private) — for original comic images, ZIPs, and PDFs.
- `processed-output` (private) — for processed/translated comic pages and exports.
Both buckets are private: access requires RLS policy authorization and uses
signed URLs.

## Storage Policies
### `source-uploads`
- SELECT: users can list/download only files in their own folder (`user_id/`).
- INSERT: users can upload only to their own folder.
- UPDATE: users can update only files in their own folder.
- DELETE: users can delete only files in their own folder.

### `processed-output`
- Same per-user folder pattern as source-uploads.

## Security
- RLS enabled on `profiles` table.
- RLS enabled on both storage buckets (via storage.objects policies).
- All policies scope to `TO authenticated` (this app requires sign-in).
- Ownership check uses `auth.uid()` everywhere.
- Grants: `authenticated` gets SELECT, INSERT, UPDATE, DELETE on `profiles`.
- No `anon` access — the app requires authentication.

## Important Notes
1. The `profiles.id` column is NOT `DEFAULT auth.uid()` because it is
   populated by the trigger, not by client inserts. The client never inserts
   into `profiles` directly — the trigger does it on signup.
2. The client CAN update its own profile (display_name, language, font, avatar).
3. The `id` column on `profiles` references `auth.users(id)` with ON DELETE
   CASCADE, so deleting a user deletes their profile.
4. Storage policies use `(storage.foldername(name))[1]` to extract the user_id
   prefix from the file path. Files must be stored as `user_id/filename`.
*/
-- ============================================================
-- PROFILES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  default_source_language text NOT NULL DEFAULT 'japanese'
    CHECK (default_source_language IN ('chinese', 'korean', 'japanese', 'english')),
  preferred_khmer_font text NOT NULL DEFAULT 'noto-sans-khmer'
    CHECK (preferred_khmer_font IN ('noto-sans-khmer', 'battambang', 'nimbus-mono-khmer')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;

-- Profiles: SELECT own
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Profiles: INSERT own (trigger handles this, but policy is here for completeness)
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Profiles: UPDATE own
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profiles: DELETE own
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('source-uploads', 'source-uploads', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('processed-output', 'processed-output', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES: source-uploads
-- ============================================================

DROP POLICY IF EXISTS "source_uploads_select_own" ON storage.objects;
CREATE POLICY "source_uploads_select_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'source-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "source_uploads_insert_own" ON storage.objects;
CREATE POLICY "source_uploads_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'source-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "source_uploads_update_own" ON storage.objects;
CREATE POLICY "source_uploads_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'source-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'source-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "source_uploads_delete_own" ON storage.objects;
CREATE POLICY "source_uploads_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'source-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- STORAGE POLICIES: processed-output
-- ============================================================

DROP POLICY IF EXISTS "processed_output_select_own" ON storage.objects;
CREATE POLICY "processed_output_select_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'processed-output'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "processed_output_insert_own" ON storage.objects;
CREATE POLICY "processed_output_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'processed-output'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "processed_output_update_own" ON storage.objects;
CREATE POLICY "processed_output_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'processed-output'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'processed-output'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "processed_output_delete_own" ON storage.objects;
CREATE POLICY "processed_output_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'processed-output'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
