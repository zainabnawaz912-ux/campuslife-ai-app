CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  department text NOT NULL DEFAULT 'General',
  semester text NOT NULL DEFAULT '1',
  condition text NOT NULL DEFAULT 'Good',
  mode text NOT NULL DEFAULT 'Sell',
  price text,
  owner text NOT NULL,
  contact text NOT NULL,
  cover text,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.books TO anon;
GRANT SELECT, INSERT ON public.books TO authenticated;
GRANT ALL ON public.books TO service_role;

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Book listings are viewable by everyone" ON public.books FOR SELECT USING (true);
CREATE POLICY "Anyone can create a book listing" ON public.books FOR INSERT WITH CHECK (true);

CREATE TABLE public.lost_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL DEFAULT 'Lost',
  location text NOT NULL,
  date text NOT NULL DEFAULT 'Today',
  status text NOT NULL DEFAULT 'Open',
  description text NOT NULL DEFAULT '',
  contact text NOT NULL,
  image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.lost_items TO anon;
GRANT SELECT, INSERT ON public.lost_items TO authenticated;
GRANT ALL ON public.lost_items TO service_role;

ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports are viewable by everyone" ON public.lost_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create a report" ON public.lost_items FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lost_items_updated_at BEFORE UPDATE ON public.lost_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();