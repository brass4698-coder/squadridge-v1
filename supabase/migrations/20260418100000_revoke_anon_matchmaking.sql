-- Matchmaking RPC must not be callable without a session; anon cannot supply auth.uid() meaningfully for queue integrity.

REVOKE EXECUTE ON FUNCTION public.matchmaking_enqueue_and_try (text, text) FROM anon;
