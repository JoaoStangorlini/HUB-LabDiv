-- ==========================================================
-- MODULE 3.5: Performance Optimization Indexes
-- Created at: 2026-02-22
-- ==========================================================

-- 1. Index for sorting by 'views' in descending order (Trending / Em Alta)
CREATE INDEX IF NOT EXISTS idx_submissions_views_desc ON public.submissions (views DESC NULLS LAST);

-- 2. Index for sorting by 'created_at' in descending order (Recent / Recentes)
CREATE INDEX IF NOT EXISTS idx_submissions_created_at_desc ON public.submissions (created_at DESC NULLS LAST);

-- 3. Composite index for filtering by 'category' and sorting by 'views'
-- Useful for category-specific trending sections
CREATE INDEX IF NOT EXISTS idx_submissions_category_views ON public.submissions (category, views DESC NULLS LAST);

-- 4. Composite index for filtering by 'status' (aprovado) and sorting by 'created_at'
-- Essential for public feeds which only show approved submissions
CREATE INDEX IF NOT EXISTS idx_submissions_status_created_at ON public.submissions (status, created_at DESC NULLS LAST);

-- 5. Composite index for filtering by 'status' and sorting by 'views'
-- Used by the "Em Alta" trending query
CREATE INDEX IF NOT EXISTS idx_submissions_status_views ON public.submissions (status, views DESC NULLS LAST);
