import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ozdashzbjzillxvqxmwf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZGFzaHpianppbGx4dnF4bXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MTg4NzMsImV4cCI6MjA2NzQ5NDg3M30.wCbaXNwj6bkRdqjljL3lXT0W1VdcGVuABWZBlwX12lI';

export const supabase = createClient(supabaseUrl, supabaseKey);