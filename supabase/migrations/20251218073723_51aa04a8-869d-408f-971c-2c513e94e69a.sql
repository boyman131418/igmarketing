-- Create a security definer function to check user role without recursion
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all ig accounts" ON public.ig_accounts;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all logs" ON public.system_logs;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all ig accounts" 
ON public.ig_accounts 
FOR ALL 
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all orders" 
ON public.orders 
FOR ALL 
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can view all logs" 
ON public.system_logs 
FOR SELECT 
USING (public.get_user_role(auth.uid()) = 'admin');