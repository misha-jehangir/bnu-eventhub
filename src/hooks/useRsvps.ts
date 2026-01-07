import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Rsvp, RsvpStatus } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useUserRsvp(eventId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-rsvp', eventId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Rsvp | null;
    },
    enabled: !!eventId && !!user,
  });
}

// Get all event IDs that the current user has RSVP'd to
export function useUserRsvpEventIds() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-rsvp-event-ids', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('rsvps')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map((r) => r.event_id);
    },
    enabled: !!user,
  });
}

export function useEventRsvps(eventId: string) {
  return useQuery({
    queryKey: ['event-rsvps', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rsvps')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Rsvp & { profile: any })[];
    },
    enabled: !!eventId,
  });
}

export function useSetRsvp() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: RsvpStatus }) => {
      if (!user) throw new Error('Must be logged in to RSVP');

      const { data, error } = await supabase
        .from('rsvps')
        .upsert(
          {
            user_id: user.id,
            event_id: eventId,
            status,
          },
          { onConflict: 'user_id,event_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-rsvp', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-rsvp-count', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-rsvps', variables.eventId] });
      toast.success(`You're now ${variables.status === 'going' ? 'going to' : 'interested in'} this event!`);
    },
    onError: (error) => {
      toast.error('Failed to update RSVP: ' + error.message);
    },
  });
}

export function useRemoveRsvp() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['user-rsvp', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-rsvp-count', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-rsvps', eventId] });
      toast.success('RSVP removed');
    },
    onError: (error) => {
      toast.error('Failed to remove RSVP: ' + error.message);
    },
  });
}
