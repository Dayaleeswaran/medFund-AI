-- Allow hospitals and admins to update campaigns (for verification routing)
CREATE POLICY "Hospitals and Admins can update campaigns"
  ON public.campaigns
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('hospital', 'admin')
    )
  );
