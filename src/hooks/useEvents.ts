import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event, EventType, EventPost, RsvpCount } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useEvents(filters?: { eventType?: EventType; organizerId?: string; showArchived?: boolean }) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          *,
          organizer:organizer_profiles(*)
        `)
        .order('event_date', { ascending: true });

      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters?.organizerId) {
        query = query.eq('organizer_id', filters.organizerId);
      }

      if (!filters?.showArchived) {
        query = query.gte('event_date', new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (Event & { organizer: any })[];
    },
  });
}

// Get all events for a specific organizer
export function useOrganizerEvents(organizerId: string | undefined) {
  return useQuery({
    queryKey: ['organizer-events', organizerId],
    queryFn: async () => {
      if (!organizerId) return [];

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', organizerId)
        .order('event_date', { ascending: false });

      if (error) throw error;
      return data as Event[];
    },
    enabled: !!organizerId,
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:organizer_profiles(*)
        `)
        .eq('id', eventId)
        .maybeSingle();

      if (error) throw error;
      return data as (Event & { organizer: any }) | null;
    },
    enabled: !!eventId,
  });
}

export function useEventRsvpCount(eventId: string) {
  return useQuery({
    queryKey: ['event-rsvp-count', eventId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_event_rsvp_count', {
        event_uuid: eventId,
      });

      if (error) throw error;
      return (data?.[0] || { interested_count: 0, going_count: 0 }) as RsvpCount;
    },
    enabled: !!eventId,
  });
}

export function useEventPosts(eventId: string) {
  return useQuery({
    queryKey: ['event-posts', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_posts')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EventPost[];
    },
    enabled: !!eventId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { organizerProfile } = useAuth();

  return useMutation({
    mutationFn: async (eventData: {
      title: string;
      description: string;
      venue: string;
      event_date: string;
      event_type: EventType;
      poster_url?: string;
    }) => {
      if (!organizerProfile) throw new Error('No organizer profile found');

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          organizer_id: organizerProfile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create event: ' + error.message);
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      updates,
    }: {
      eventId: string;
      updates: Partial<Event>;
    }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      // Notify RSVP'd users
      await supabase.rpc('notify_rsvp_users', {
        p_event_id: eventId,
        p_type: 'event_updated',
        p_title: 'Event Updated',
        p_message: `The event "${data.title}" has been updated.`,
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', data.id] });
      toast.success('Event updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update event: ' + error.message);
    },
  });
}

export function useCancelEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data, error } = await supabase
        .from('events')
        .update({ is_cancelled: true })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      // Notify RSVP'd users
      await supabase.rpc('notify_rsvp_users', {
        p_event_id: eventId,
        p_type: 'event_cancelled',
        p_title: 'Event Cancelled',
        p_message: `The event "${data.title}" has been cancelled.`,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event cancelled successfully!');
    },
    onError: (error) => {
      toast.error('Failed to cancel event: ' + error.message);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, eventTitle }: { eventId: string; eventTitle: string }) => {
      // Notify before deleting
      await supabase.rpc('notify_rsvp_users', {
        p_event_id: eventId,
        p_type: 'event_deleted',
        p_title: 'Event Deleted',
        p_message: `The event "${eventTitle}" has been deleted.`,
      });

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete event: ' + error.message);
    },
  });
}

export function useCreateEventPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, content }: { eventId: string; content: string }) => {
      const { data: eventData } = await supabase
        .from('events')
        .select('title')
        .eq('id', eventId)
        .single();

      const { data, error } = await supabase
        .from('event_posts')
        .insert({ event_id: eventId, content })
        .select()
        .single();

      if (error) throw error;

      // Notify RSVP'd users
      await supabase.rpc('notify_rsvp_users', {
        p_event_id: eventId,
        p_type: 'event_post',
        p_title: 'New Event Update',
        p_message: `New update posted for "${eventData?.title}": ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-posts', variables.eventId] });
      toast.success('Update posted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to post update: ' + error.message);
    },
  });
}
