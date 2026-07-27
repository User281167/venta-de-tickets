-- 1. Enable RLS on all existing tables
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
  END LOOP;
END $$;

-- 2. (Optional) Add a policy to allow your seed script to work if using 'anon' key
-- OR simply use the 'service_role' key for seeding (Recommended)
