-- Admin Notifications Management Table
-- Tracks notifications sent by moderators/admins to users

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  target_type TEXT NOT NULL CHECK (target_type IN ('broadcast', 'user', 'group')),
  target_value TEXT, -- user_id for 'user', category name for 'group', null for 'broadcast'
  recipients_count INT DEFAULT 0,
  scheduled_at TIMESTAMPTZ, -- null = immediate send
  sent_at TIMESTAMPTZ, -- filled when actually sent
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'scheduled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for history queries
CREATE INDEX idx_admin_notifications_status ON admin_notifications(status);
CREATE INDEX idx_admin_notifications_created ON admin_notifications(created_at DESC);

-- RLS
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only moderators and admins can manage
CREATE POLICY "Moderators and admins can manage admin_notifications"
  ON admin_notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );
