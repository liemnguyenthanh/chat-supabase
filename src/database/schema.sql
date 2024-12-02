-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Channels table
CREATE TABLE channels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Channel members table (for managing user-channel relationships)
CREATE TABLE channel_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- member, admin, owner
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(channel_id, user_id)
);

-- Message types enum
CREATE TYPE message_type AS ENUM ('text', 'custom', 'attachment', 'reply');

-- Messages table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type message_type DEFAULT 'text',
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- For storing type-specific data
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false
);

-- Message attachments table
CREATE TABLE message_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_name VARCHAR(255),
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Reactions table
CREATE TABLE message_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(message_id, user_id, emoji)
);

-- Create indexes for better query performance
CREATE INDEX idx_messages_channel_id ON messages(channel_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_channel_members_user_id ON channel_members(user_id);
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_channel_members_last_read ON channel_members(last_read_at);

-- Create a view for the latest messages in channels
CREATE OR REPLACE VIEW channel_latest_messages AS
SELECT DISTINCT ON (m.channel_id)
    m.channel_id,
    m.id as message_id,
    m.content,
    m.created_at as message_created_at,
    m.type as message_type,
    u.username as last_message_username,
    u.avatar_url as last_message_user_avatar
FROM messages m
LEFT JOIN users u ON m.user_id = u.id
ORDER BY m.channel_id, m.created_at DESC;

-- Function to get user's channels with latest messages
CREATE OR REPLACE FUNCTION get_user_channels_with_latest_messages(p_user_id UUID)
RETURNS TABLE (
    channel_id UUID,
    channel_title VARCHAR(100),
    channel_avatar_url TEXT,
    last_message_id UUID,
    last_message_content TEXT,
    last_message_created_at TIMESTAMP WITH TIME ZONE,
    last_message_type message_type,
    last_message_username VARCHAR(50),
    last_message_user_avatar TEXT,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as channel_id,
        c.title as channel_title,
        c.avatar_url as channel_avatar_url,
        clm.message_id as last_message_id,
        clm.content as last_message_content,
        clm.message_created_at as last_message_created_at,
        clm.message_type as last_message_type,
        clm.last_message_username,
        clm.last_message_user_avatar,
        COUNT(m.id) FILTER (WHERE m.created_at > cm.last_read_at) as unread_count
    FROM channels c
    INNER JOIN channel_members cm ON c.id = cm.channel_id
    LEFT JOIN channel_latest_messages clm ON c.id = clm.channel_id
    LEFT JOIN messages m ON c.id = m.channel_id AND m.created_at > cm.last_read_at
    WHERE cm.user_id = p_user_id
    GROUP BY 
        c.id, 
        c.title, 
        c.avatar_url,
        clm.message_id,
        clm.content,
        clm.message_created_at,
        clm.message_type,
        clm.last_message_username,
        clm.last_message_user_avatar,
        cm.last_read_at
    ORDER BY clm.message_created_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Function to update last read timestamp
CREATE OR REPLACE FUNCTION update_channel_last_read(
    p_channel_id UUID,
    p_user_id UUID
) RETURNS void AS $$
BEGIN
    UPDATE channel_members
    SET last_read_at = TIMEZONE('utc', NOW())
    WHERE channel_id = p_channel_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if direct channel exists between users
CREATE OR REPLACE FUNCTION get_direct_channel(
    p_user_id1 UUID,
    p_user_id2 UUID
) RETURNS UUID AS $$
DECLARE
    v_channel_id UUID;
BEGIN
    SELECT c.id INTO v_channel_id
    FROM channels c
    INNER JOIN channel_members cm1 ON c.id = cm1.channel_id
    INNER JOIN channel_members cm2 ON c.id = cm2.channel_id
    WHERE c.is_private = true
    AND cm1.user_id = p_user_id1
    AND cm2.user_id = p_user_id2
    LIMIT 1;
    
    RETURN v_channel_id;
END;
$$ LANGUAGE plpgsql;