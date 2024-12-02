import { supabase } from './supabase';

export const setupDatabase = async () => {
  // Create channels table
  const { error: channelsError } = await supabase
    .from('channels')
    .select()
    .limit(1);

  if (channelsError && channelsError.code === '42P01') {
    // Table doesn't exist, create it
    const { error } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS channels (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        CREATE TABLE IF NOT EXISTS messages (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          content TEXT NOT NULL,
          user_id TEXT NOT NULL,
          username TEXT NOT NULL,
          channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        -- Enable RLS
        ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Allow public read access" ON channels
          FOR SELECT USING (true);

        CREATE POLICY "Allow public insert access" ON channels
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "Allow public read access" ON messages
          FOR SELECT USING (true);

        CREATE POLICY "Allow public insert access" ON messages
          FOR INSERT WITH CHECK (true);

        -- Enable realtime
        ALTER PUBLICATION supabase_realtime ADD TABLE channels;
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
      `
    });

    if (error) {
      console.error('Error creating tables:', error);
      return;
    }

    // Create initial general channel
    const { error: insertError } = await supabase
      .from('channels')
      .insert([{ name: 'general' }])
      .select()
      .maybeSingle();

    if (insertError && !insertError.message.includes('duplicate')) {
      console.error('Error creating general channel:', insertError);
    }
  }
};

// No need for separate realtime enablement as it's handled in the table creation
export const enableRealtimeSubscriptions = async () => {
  // Realtime is now enabled through the table creation SQL
  return Promise.resolve();
};