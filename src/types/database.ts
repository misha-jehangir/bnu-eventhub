export type UserRole = 'student' | 'organizer';
export type RsvpStatus = 'interested' | 'going';
export type EventType = 'academic' | 'social' | 'sports' | 'cultural' | 'workshop' | 'career' | 'other';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizerProfile {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  venue: string;
  event_date: string;
  event_type: EventType;
  poster_url: string | null;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
  organizer?: OrganizerProfile;
}

export interface Rsvp {
  id: string;
  user_id: string;
  event_id: string;
  status: RsvpStatus;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Follow {
  id: string;
  follower_id: string;
  organizer_id: string;
  created_at: string;
}

export interface EventPost {
  id: string;
  event_id: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  event_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  event?: Event;
}

export interface RsvpCount {
  interested_count: number;
  going_count: number;
}
