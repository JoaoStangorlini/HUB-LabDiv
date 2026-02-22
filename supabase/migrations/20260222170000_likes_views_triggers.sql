-- Migration: Add like_count to submissions and create triggers for auto-updating.

-- 1. Add like_count column
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- 2. Update existing counts
UPDATE public.submissions s
SET like_count = (
    SELECT COUNT(*)
    FROM public.curtidas c
    WHERE c.submission_id = s.id
);

-- 3. Create the Trigger Function
CREATE OR REPLACE FUNCTION update_submission_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.submissions
        SET like_count = like_count + 1
        WHERE id = NEW.submission_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.submissions
        SET like_count = GREATEST(like_count - 1, 0)
        WHERE id = OLD.submission_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the Trigger
DROP TRIGGER IF EXISTS trigger_update_like_count ON public.curtidas;
CREATE TRIGGER trigger_update_like_count
AFTER INSERT OR DELETE ON public.curtidas
FOR EACH ROW EXECUTE FUNCTION update_submission_like_count();
