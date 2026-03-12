-- Uses your existing words table (word_id, word, word_category, word_points, words_hint)
-- Adds hints and function to fetch random word

-- Update hints for existing words
update public.words set words_hint = 'Art of composing and arranging text' where word = 'TYPOGRAPHY';
update public.words set words_hint = 'Set of colors in a project' where word = 'PALETTE';
update public.words set words_hint = 'Visual skeleton of a page' where word = 'WIREFRAME';
update public.words set words_hint = 'Initial version of a product' where word = 'PROTOTYPE';
update public.words set words_hint = 'High-fidelity visual representation' where word = 'MOCKUP';
update public.words set words_hint = 'Organization by visual importance' where word = 'HIERARCHY';
update public.words set words_hint = 'Difference between visual elements' where word = 'CONTRAST';
update public.words set words_hint = 'Orderly positioning of elements' where word = 'ALIGNMENT';
update public.words set words_hint = 'Distance between elements' where word = 'SPACING';
update public.words set words_hint = 'Smooth transition between colors' where word = 'GRADIENT';
update public.words set words_hint = 'Style with few elements' where word = 'MINIMALISM';
update public.words set words_hint = 'Adapts to different screens' where word = 'RESPONSIVE';
update public.words set words_hint = 'Use of icons in design' where word = 'ICONOGRAPHY';
update public.words set words_hint = 'Building visual identity' where word = 'BRANDING';
update public.words set words_hint = 'Arrangement of elements on a page' where word = 'LAYOUT';
update public.words set words_hint = 'Line system to organize content' where word = 'GRID';
update public.words set words_hint = 'Font with small strokes on letters' where word = 'SERIF';
update public.words set words_hint = 'Adjustment of space between letters' where word = 'KERNING';
update public.words set words_hint = 'Math-based graphic' where word = 'VECTOR';
update public.words set words_hint = 'Smallest unit of a digital image' where word = 'PIXEL';
update public.words set words_hint = 'Web programming language' where word = 'JAVASCRIPT';
update public.words set words_hint = 'JavaScript with static typing' where word = 'TYPESCRIPT';
update public.words set words_hint = 'Reusable UI block' where word = 'COMPONENT';
update public.words set words_hint = 'Special React function' where word = 'HOOK';
update public.words set words_hint = 'Data that changes in a component' where word = 'STATE';
update public.words set words_hint = 'Properties passed between components' where word = 'PROPS';
update public.words set words_hint = 'Utility-first CSS framework' where word = 'TAILWIND';
update public.words set words_hint = 'One-dimensional layout system' where word = 'FLEXBOX';
update public.words set words_hint = 'Operation that does not block execution' where word = 'ASYNC';
update public.words set words_hint = 'Function passed as an argument' where word = 'CALLBACK';
update public.words set words_hint = 'Asynchronous operation object' where word = 'PROMISE';
update public.words set words_hint = 'API for HTTP requests' where word = 'FETCH';
update public.words set words_hint = 'Navigation manager' where word = 'ROUTER';
update public.words set words_hint = 'Code between request and response' where word = 'MIDDLEWARE';
update public.words set words_hint = 'Publish application to production' where word = 'DEPLOY';
update public.words set words_hint = 'File with grouped code' where word = 'BUNDLE';
update public.words set words_hint = 'Process of drawing on screen' where word = 'RENDER';
update public.words set words_hint = 'Temporary data storage' where word = 'CACHE';
update public.words set words_hint = 'Document object model' where word = 'DOM';
update public.words set words_hint = 'Programming interface' where word = 'API';
update public.words set words_hint = 'Desired user action' where word = 'CONVERSION';
update public.words set words_hint = 'Customer journey to purchase' where word = 'FUNNEL';
update public.words set words_hint = 'Potential customers' where word = 'LEADS';
update public.words set words_hint = 'Audience interaction' where word = 'ENGAGEMENT';
update public.words set words_hint = 'Data to measure results' where word = 'METRICS';
update public.words set words_hint = 'Behavior data analysis' where word = 'ANALYTICS';
update public.words set words_hint = 'Keeping customers active' where word = 'RETENTION';
update public.words set words_hint = 'Cancellation rate' where word = 'CHURN';
update public.words set words_hint = 'Representation of ideal customer' where word = 'PERSONA';
update public.words set words_hint = 'Specific audience group' where word = 'SEGMENT';
update public.words set words_hint = 'Planned promotional action' where word = 'CAMPAIGN';
update public.words set words_hint = 'A/B experiment' where word = 'TEST';
update public.words set words_hint = 'Rejection rate' where word = 'BOUNCE';
update public.words set words_hint = 'Basic ad interaction' where word = 'CLICK';
update public.words set words_hint = 'Content view' where word = 'IMPRESSION';
update public.words set words_hint = 'Number of people reached' where word = 'REACH';
update public.words set words_hint = 'Content that spreads quickly' where word = 'VIRAL';
update public.words set words_hint = 'Person with large audience' where word = 'INFLUENCER';
update public.words set words_hint = 'Rapid growth strategy' where word = 'GROWTH';
update public.words set words_hint = 'Return on investment' where word = 'ROI';

-- Insert missing words (skips if word already exists)
insert into public.words (word, word_category, word_points, words_hint)
select v.word, v.word_category, v.word_points, v.words_hint
from (values
  ('PALETTE', 'design', 15, 'Set of colors in a project'),
  ('WIREFRAME', 'design', 15, 'Visual skeleton of a page'),
  ('PROTOTYPE', 'design', 15, 'Initial version of a product'),
  ('MOCKUP', 'design', 15, 'High-fidelity visual representation'),
  ('HIERARCHY', 'design', 15, 'Organization by visual importance'),
  ('CONTRAST', 'design', 15, 'Difference between visual elements'),
  ('ALIGNMENT', 'design', 15, 'Orderly positioning of elements'),
  ('SPACING', 'design', 15, 'Distance between elements'),
  ('GRADIENT', 'design', 15, 'Smooth transition between colors'),
  ('MINIMALISM', 'design', 15, 'Style with few elements'),
  ('RESPONSIVE', 'design', 15, 'Adapts to different screens'),
  ('ICONOGRAPHY', 'design', 15, 'Use of icons in design'),
  ('BRANDING', 'design', 15, 'Building visual identity'),
  ('LAYOUT', 'design', 15, 'Arrangement of elements on a page'),
  ('GRID', 'design', 15, 'Line system to organize content'),
  ('SERIF', 'design', 15, 'Font with small strokes on letters'),
  ('KERNING', 'design', 15, 'Adjustment of space between letters'),
  ('VECTOR', 'design', 15, 'Math-based graphic'),
  ('PIXEL', 'design', 15, 'Smallest unit of a digital image'),
  ('JAVASCRIPT', 'frontend', 15, 'Web programming language'),
  ('TYPESCRIPT', 'frontend', 15, 'JavaScript with static typing'),
  ('COMPONENT', 'frontend', 15, 'Reusable UI block'),
  ('HOOK', 'frontend', 15, 'Special React function'),
  ('STATE', 'frontend', 15, 'Data that changes in a component'),
  ('PROPS', 'frontend', 15, 'Properties passed between components'),
  ('TAILWIND', 'frontend', 15, 'Utility-first CSS framework'),
  ('FLEXBOX', 'frontend', 15, 'One-dimensional layout system'),
  ('ASYNC', 'frontend', 15, 'Operation that does not block execution'),
  ('CALLBACK', 'frontend', 15, 'Function passed as an argument'),
  ('PROMISE', 'frontend', 15, 'Asynchronous operation object'),
  ('FETCH', 'frontend', 15, 'API for HTTP requests'),
  ('ROUTER', 'frontend', 15, 'Navigation manager'),
  ('MIDDLEWARE', 'frontend', 15, 'Code between request and response'),
  ('DEPLOY', 'frontend', 15, 'Publish application to production'),
  ('BUNDLE', 'frontend', 15, 'File with grouped code'),
  ('RENDER', 'frontend', 15, 'Process of drawing on screen'),
  ('CACHE', 'frontend', 15, 'Temporary data storage'),
  ('DOM', 'frontend', 15, 'Document object model'),
  ('API', 'frontend', 15, 'Programming interface'),
  ('CONVERSION', 'marketing', 15, 'Desired user action'),
  ('FUNNEL', 'marketing', 15, 'Customer journey to purchase'),
  ('LEADS', 'marketing', 15, 'Potential customers'),
  ('ENGAGEMENT', 'marketing', 15, 'Audience interaction'),
  ('METRICS', 'marketing', 15, 'Data to measure results'),
  ('ANALYTICS', 'marketing', 15, 'Behavior data analysis'),
  ('RETENTION', 'marketing', 15, 'Keeping customers active'),
  ('CHURN', 'marketing', 15, 'Cancellation rate'),
  ('PERSONA', 'marketing', 15, 'Representation of ideal customer'),
  ('SEGMENT', 'marketing', 15, 'Specific audience group'),
  ('CAMPAIGN', 'marketing', 15, 'Planned promotional action'),
  ('TEST', 'marketing', 15, 'A/B experiment'),
  ('BOUNCE', 'marketing', 15, 'Rejection rate'),
  ('CLICK', 'marketing', 15, 'Basic ad interaction'),
  ('IMPRESSION', 'marketing', 15, 'Content view'),
  ('REACH', 'marketing', 15, 'Number of people reached'),
  ('VIRAL', 'marketing', 15, 'Content that spreads quickly'),
  ('INFLUENCER', 'marketing', 15, 'Person with large audience'),
  ('GROWTH', 'marketing', 15, 'Rapid growth strategy'),
  ('ROI', 'marketing', 15, 'Return on investment')
) as v(word, word_category, word_points, words_hint)
where not exists (select 1 from public.words w where w.word = v.word);

-- Function to get random word (uses your columns: word, words_hint, word_category)
-- Returns word_id for saving to game table
drop function if exists public.get_random_word();
create or replace function public.get_random_word()
returns table (word_id int8, word text, hint text, category text)
language sql
security definer
set search_path = public
as $$
  select w.word_id, w.word, coalesce(w.words_hint, ''), w.word_category
  from words w
  order by random()
  limit 1;
$$;
