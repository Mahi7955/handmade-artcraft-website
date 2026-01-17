-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

-- Admins can do everything (using a simple approach for now)
CREATE POLICY "Authenticated users can manage categories" 
ON public.categories 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for ordering
CREATE INDEX idx_categories_display_order ON public.categories(display_order);
CREATE INDEX idx_categories_slug ON public.categories(slug);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (slug, name, description, image_url, display_order) VALUES
('crochet', 'Crochet', 'Delicate hooks, endless possibilities', 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=400&fit=crop', 1),
('knitting', 'Knitting', 'Cozy knits for every season', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', 2),
('yarn-art', 'Yarn Art', 'Artistic expressions in fiber', 'https://images.unsplash.com/photo-1597843786411-a7fa8ad44a95?w=400&h=400&fit=crop', 3),
('handmade-gifts', 'Handmade Gifts', 'Thoughtful presents, made with care', 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400&h=400&fit=crop', 4);