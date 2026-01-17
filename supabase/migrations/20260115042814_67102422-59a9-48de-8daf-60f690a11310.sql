-- Drop the existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;

-- Create new permissive policies for categories
-- Allow anyone to view all categories (including inactive for admin)
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

-- Allow anyone to insert categories (since we use Firebase Auth)
CREATE POLICY "Allow insert categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update categories (since we use Firebase Auth)
CREATE POLICY "Allow update categories" 
ON public.categories 
FOR UPDATE 
USING (true);

-- Allow anyone to delete categories (since we use Firebase Auth)
CREATE POLICY "Allow delete categories" 
ON public.categories 
FOR DELETE 
USING (true);