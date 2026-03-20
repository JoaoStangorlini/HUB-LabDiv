-- Add content_format column to submissions and wiki_articles
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS content_format TEXT;
ALTER TABLE public.wiki_articles ADD COLUMN IF NOT EXISTS content_format TEXT;

-- Initialize content_format based on media_type in submissions
-- Using ::text to avoid enum comparison issues
UPDATE public.submissions 
SET content_format = CASE 
    WHEN media_type::text = 'image' THEN 'image'
    WHEN media_type::text = 'video' THEN 'video'
    ELSE 'text'
END
WHERE content_format IS NULL;

-- Set default for wiki_articles
UPDATE public.wiki_articles SET content_format = 'text' WHERE content_format IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.submissions.content_format IS 'Scientific Telemetry: text, audio, image, video, mixed';
COMMENT ON COLUMN public.wiki_articles.content_format IS 'Scientific Telemetry: text, audio, image, video, mixed';
