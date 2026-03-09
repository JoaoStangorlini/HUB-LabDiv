CREATE OR REPLACE FUNCTION public.nuclear_reset_v5()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Truncate all tables in public schema to ensure all FKs are cleared
  TRUNCATE TABLE public.submissions CASCADE;
  TRUNCATE TABLE public.contatos CASCADE;
  TRUNCATE TABLE public.curtidas CASCADE;
  TRUNCATE TABLE public.perguntas CASCADE;
  TRUNCATE TABLE public.oportunidades CASCADE;
  TRUNCATE TABLE public.comentarios CASCADE;
  TRUNCATE TABLE public.comments CASCADE;
  TRUNCATE TABLE public.profiles CASCADE;
  TRUNCATE TABLE public.reproductions CASCADE;
  TRUNCATE TABLE public.testimonials CASCADE;
  TRUNCATE TABLE public.badges CASCADE;
  TRUNCATE TABLE public.user_badges CASCADE;
  TRUNCATE TABLE public.playlists CASCADE;
  TRUNCATE TABLE public.playlist_items CASCADE;
  TRUNCATE TABLE public.saved_posts CASCADE;
  TRUNCATE TABLE public.follows CASCADE;
  TRUNCATE TABLE public.corrections CASCADE;
  TRUNCATE TABLE public.private_notes CASCADE;
  TRUNCATE TABLE public.reports CASCADE;
  TRUNCATE TABLE public.analytics_plays CASCADE;
  TRUNCATE TABLE public.learning_trails CASCADE;
  TRUNCATE TABLE public.trail_submissions CASCADE;
  TRUNCATE TABLE public.reading_history CASCADE;
  TRUNCATE TABLE public.collections CASCADE;
  TRUNCATE TABLE public.collection_items CASCADE;
  TRUNCATE TABLE public.reactions CASCADE;
  TRUNCATE TABLE public.notification_queue CASCADE;
  TRUNCATE TABLE public.notifications CASCADE;
  TRUNCATE TABLE public.kudos CASCADE;
  TRUNCATE TABLE public.tag_follows CASCADE;
  TRUNCATE TABLE public.profile_badges CASCADE;
  TRUNCATE TABLE public.map_interactions CASCADE;
  TRUNCATE TABLE public.kudos_quota_logs CASCADE;
  TRUNCATE TABLE public.profiles_xp_history CASCADE;
  TRUNCATE TABLE public.feedback_reports CASCADE;
  TRUNCATE TABLE public.wiki_articles CASCADE;
  TRUNCATE TABLE public.wiki_citations CASCADE;
  TRUNCATE TABLE public.entanglement_messages CASCADE;
  TRUNCATE TABLE public.pseudonyms CASCADE;
  TRUNCATE TABLE public.messages CASCADE;
  TRUNCATE TABLE public.quiz_attempts CASCADE;
  TRUNCATE TABLE public.adoptions CASCADE;
  TRUNCATE TABLE public.quiz_questions CASCADE;
  TRUNCATE TABLE public.submission_quiz_responses CASCADE;
  TRUNCATE TABLE public.user_trail_progress CASCADE;
  TRUNCATE TABLE public.equivalence_exclusions CASCADE;
  TRUNCATE TABLE public.user_completed_trails CASCADE;

  -- Now clear auth users
  DELETE FROM auth.users;
END;
$$;
