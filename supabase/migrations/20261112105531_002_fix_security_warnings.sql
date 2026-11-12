/*
# Fix Security Advisor Warnings on Phase 1 Functions

## Overview
Fixes three security warnings flagged by the database advisor:
1. `handle_new_user()` — SECURITY DEFINER function callable by anon and
   authenticated roles via the REST API. This function should only run as a
   trigger on auth.users INSERT, never as a direct RPC call.
2. `update_updated_at_column()` — has a mutable search_path, which is a
   security risk for SECURITY DEFINER functions.

## Changes
1. REVOKE EXECUTE on `handle_new_user()` from PUBLIC, anon, and authenticated.
   The function is only called by the `on_auth_user_created` trigger on
   `auth.users`, which runs with sufficient privileges. No client should ever
   call it directly.
2. Recreate `update_updated_at_column()` with `SET search_path = public` to
   lock the search path.
3. Revoke EXECUTE on `update_updated_at_column()` from PUBLIC, anon, and
   authenticated for the same reason — it is trigger-only.

## Security
- No new tables or policies.
- Reduces attack surface by preventing direct RPC calls to internal trigger functions.
*/
-- Fix 1: Lock down handle_new_user — trigger only, no RPC access
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Fix 2: Recreate update_updated_at_column with locked search_path
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
