
-- This function enables Postgres realtime for the specified table
CREATE OR REPLACE FUNCTION public.enable_realtime_for_table(table_name text)
RETURNS void AS $$
BEGIN
  -- Set replica identity to full for the table to ensure complete row data is available
  EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', table_name);
  
  -- Add the table to the supabase_realtime publication
  EXECUTE format(
    'ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',
    table_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.enable_realtime_for_table(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.enable_realtime_for_table(text) TO service_role;
