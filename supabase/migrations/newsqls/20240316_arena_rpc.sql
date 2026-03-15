-- RPC for incrementing votes
CREATE OR REPLACE FUNCTION increment_submission_vote(sub_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.challenge_submissions
    SET votes_count = votes_count + 1
    WHERE id = sub_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
