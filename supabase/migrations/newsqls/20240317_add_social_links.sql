-- Migration: Add Social Links to Profiles
-- Description: Adds columns for LinkedIn, GitHub, YouTube, TikTok, and Instagram URLs.

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS github_url VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS tiktok_url VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255) DEFAULT '';
