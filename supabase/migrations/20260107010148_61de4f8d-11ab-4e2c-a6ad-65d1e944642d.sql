-- Create storage bucket for event posters
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-posters', 'event-posters', true);

-- Allow public read access to event posters
CREATE POLICY "Event posters are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-posters');

-- Allow authenticated users to upload event posters
CREATE POLICY "Authenticated users can upload event posters"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-posters' AND auth.role() = 'authenticated');

-- Allow users to update their own uploaded files
CREATE POLICY "Users can update their own event posters"
ON storage.objects FOR UPDATE
USING (bucket_id = 'event-posters' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own uploaded files
CREATE POLICY "Users can delete their own event posters"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-posters' AND auth.uid()::text = (storage.foldername(name))[1]);