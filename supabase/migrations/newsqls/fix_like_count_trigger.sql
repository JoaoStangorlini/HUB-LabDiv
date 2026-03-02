-- Fix the trigger to use absolute count instead of increment/decrement
CREATE OR REPLACE FUNCTION public.update_submission_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    target_id uuid;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_id := OLD.submission_id;
    ELSE
        target_id := NEW.submission_id;
    END IF;

    UPDATE public.submissions
    SET like_count = (
        SELECT count(*) FROM public.curtidas WHERE submission_id = target_id
    )
    WHERE id = target_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$function$;

-- Sync all existing stale like_count values
UPDATE public.submissions s
SET like_count = (
    SELECT count(*) FROM public.curtidas c WHERE c.submission_id = s.id
);
