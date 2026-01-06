-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('student', 'organizer');

-- Create enum for RSVP status
CREATE TYPE public.rsvp_status AS ENUM ('interested', 'going');

-- Create enum for event types
CREATE TYPE public.event_type AS ENUM ('academic', 'social', 'sports', 'cultural', 'workshop', 'career', 'other');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organizer profiles table
CREATE TABLE public.organizer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES public.organizer_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  venue TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_type event_type NOT NULL DEFAULT 'other',
  poster_url TEXT,
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RSVPs table
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status rsvp_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create follows table
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES public.organizer_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, organizer_id)
);

-- Create event posts table (updates to events)
CREATE TABLE public.event_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Organizer profiles policies
CREATE POLICY "Organizer profiles are viewable by everyone"
ON public.organizer_profiles FOR SELECT
USING (true);

CREATE POLICY "Organizers can update their own profile"
ON public.organizer_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Organizers can insert their own profile"
ON public.organizer_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can delete their own profile"
ON public.organizer_profiles FOR DELETE
USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Events are viewable by everyone"
ON public.events FOR SELECT
USING (true);

CREATE POLICY "Organizers can insert events"
ON public.events FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organizer_profiles
    WHERE id = organizer_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Organizers can update their own events"
ON public.events FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.organizer_profiles
    WHERE id = organizer_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Organizers can delete their own events"
ON public.events FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.organizer_profiles
    WHERE id = organizer_id AND user_id = auth.uid()
  )
);

-- RSVPs policies
CREATE POLICY "RSVPs are viewable by event organizers"
ON public.rsvps FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organizer_profiles op ON e.organizer_id = op.id
    WHERE e.id = event_id AND op.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own RSVP"
ON public.rsvps FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RSVP"
ON public.rsvps FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own RSVP"
ON public.rsvps FOR DELETE
USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone"
ON public.follows FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own follows"
ON public.follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
ON public.follows FOR DELETE
USING (auth.uid() = follower_id);

-- Event posts policies
CREATE POLICY "Event posts are viewable by everyone"
ON public.event_posts FOR SELECT
USING (true);

CREATE POLICY "Organizers can insert posts to their events"
ON public.event_posts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organizer_profiles op ON e.organizer_id = op.id
    WHERE e.id = event_id AND op.user_id = auth.uid()
  )
);

CREATE POLICY "Organizers can delete posts from their events"
ON public.event_posts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organizer_profiles op ON e.organizer_id = op.id
    WHERE e.id = event_id AND op.user_id = auth.uid()
  )
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizer_profiles_updated_at
BEFORE UPDATE ON public.organizer_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rsvps_updated_at
BEFORE UPDATE ON public.rsvps
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get RSVP count for an event
CREATE OR REPLACE FUNCTION public.get_event_rsvp_count(event_uuid UUID)
RETURNS TABLE(interested_count BIGINT, going_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE status = 'interested') as interested_count,
    COUNT(*) FILTER (WHERE status = 'going') as going_count
  FROM public.rsvps
  WHERE event_id = event_uuid;
END;
$$;

-- Function to create notification for RSVP'd users
CREATE OR REPLACE FUNCTION public.notify_rsvp_users(
  p_event_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, event_id, type, title, message)
  SELECT r.user_id, p_event_id, p_type, p_title, p_message
  FROM public.rsvps r
  WHERE r.event_id = p_event_id;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX idx_events_event_type ON public.events(event_type);
CREATE INDEX idx_rsvps_event_id ON public.rsvps(event_id);
CREATE INDEX idx_rsvps_user_id ON public.rsvps(user_id);
CREATE INDEX idx_follows_organizer_id ON public.follows(organizer_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;