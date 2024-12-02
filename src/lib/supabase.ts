import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kqodbuewnrfzehtdarua.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxb2RidWV3bnJmemVodGRhcnVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4NDY3MjQsImV4cCI6MjA0ODQyMjcyNH0.mYgsY23EkDnEB1x2m5hl8z7jguc-_VMIEOpGIHLFf4c';

export const supabase = createClient(supabaseUrl, supabaseKey);