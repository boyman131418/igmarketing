-- Create platform_settings table for admin-controlled payment info
CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view platform settings"
ON public.platform_settings
FOR SELECT
USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can manage platform settings"
ON public.platform_settings
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Insert default payment settings
INSERT INTO public.platform_settings (key, value) VALUES
('payment_fps_number', '87925469'),
('payment_email', 'boyman131418@gmail.com'),
('payment_methods', 'FPS, PayMe, 銀行轉賬');