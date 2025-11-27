
// Supabase configuration
const SUPABASE_URL = 'https://osmeayyygpscyjfkarwb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbWVheXl5Z3BzY3lqZmthcndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzAzMjksImV4cCI6MjA3OTgwNjMyOX0.FTm5MXGYv6kbX-HnnJf3YP8QZgnubGeY64j26oRTUTA';

// Initialize Supabase client
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

export { client as supabase };
console.log('Supabase module loaded');
