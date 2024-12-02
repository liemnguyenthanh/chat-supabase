-- Get all channels for a user with latest messages and unread counts
SELECT * FROM get_user_channels_with_latest_messages('user_uuid_here');

-- Get all messages in a channel with reactions and attachments
SELECT 
    m.id,
    m.content,
    m.type,
    m.created_at,
    m.is_edited,
    u.username,
    u.avatar_url,
    COALESCE(
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'emoji', mr.emoji,
                'count', COUNT(mr.id),
                'users', jsonb_agg(DISTINCT ru.username)
            )
        ) FILTER (WHERE mr.id IS NOT NULL),
        '[]'
    ) as reactions,
    COALESCE(
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'id', ma.id,
                'file_url', ma.file_url,
                'file_type', ma.file_type,
                'file_name', ma.file_name
            )
        ) FILTER (WHERE ma.id IS NOT NULL),
        '[]'
    ) as attachments
FROM messages m
LEFT JOIN users u ON m.user_id = u.id
LEFT JOIN message_reactions mr ON m.id = mr.message_id
LEFT JOIN users ru ON mr.user_id = ru.id
LEFT JOIN message_attachments ma ON m.id = ma.message_id
WHERE m.channel_id = 'channel_uuid_here'
GROUP BY m.id, u.username, u.avatar_url
ORDER BY m.created_at DESC;

-- Get channel members with their roles
SELECT 
    u.username,
    u.avatar_url,
    cm.role,
    cm.joined_at
FROM channel_members cm
JOIN users u ON cm.user_id = u.id
WHERE cm.channel_id = 'channel_uuid_here'
ORDER BY 
    CASE cm.role 
        WHEN 'owner' THEN 1 
        WHEN 'admin' THEN 2 
        WHEN 'member' THEN 3 
    END,
    cm.joined_at;