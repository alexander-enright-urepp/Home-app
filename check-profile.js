// Check what's happening with profiles
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fmzmnirvbrflzzkihvki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtem1uaXJ2YnJmbHp6a2lodmtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjEyMTMsImV4cCI6MjA4OTkzNzIxM30.EZL_vH3zK0MrSjf97mvpM-gf7LuxBpJQNTc93lD28uc'
);

async function checkProfiles() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');
  
  console.log('Profiles:', profiles);
  console.log('Error:', error);
}

checkProfiles();
