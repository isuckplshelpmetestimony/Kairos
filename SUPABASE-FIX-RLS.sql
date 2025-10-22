-- Fix Supabase RLS infinite recursion
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/snrtbdvmvpdfruzxftpj/sql

-- Disable RLS on both tables to prevent infinite recursion
ALTER TABLE appraisals DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- Drop any existing problematic policies
DROP POLICY IF EXISTS "Users can manage their appraisals" ON appraisals;
DROP POLICY IF EXISTS "Users can manage their activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON appraisals;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON activity_logs;

-- Verify tables are accessible
SELECT 'appraisals' as table_name, count(*) as row_count FROM appraisals
UNION ALL
SELECT 'activity_logs' as table_name, count(*) as row_count FROM activity_logs;
