import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OrganizerProfile, Follow } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useOrganizers() {
  return useQuery({
    queryKey: ['organizers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizer_profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as OrganizerProfile[];
    },
  });
}

export function useOrganizer(organizerId: string) {
  return useQuery({
    queryKey: ['organizer', organizerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizer_profiles')
        .select('*')
        .eq('id', organizerId)
        .maybeSingle();

      if (error) throw error;
      return data as OrganizerProfile | null;
    },
    enabled: !!organizerId,
  });
}

export function useFollowStatus(organizerId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['follow-status', organizerId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('organizer_id', organizerId)
        .eq('follower_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!organizerId && !!user,
  });
}

export function useFollowerCount(organizerId: string) {
  return useQuery({
    queryKey: ['follower-count', organizerId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('organizer_id', organizerId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!organizerId,
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ organizerId, isFollowing }: { organizerId: string; isFollowing: boolean }) => {
      if (!user) throw new Error('Must be logged in to follow');

      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('organizer_id', organizerId)
          .eq('follower_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            organizer_id: organizerId,
            follower_id: user.id,
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['follow-status', variables.organizerId] });
      queryClient.invalidateQueries({ queryKey: ['follower-count', variables.organizerId] });
      toast.success(variables.isFollowing ? 'Unfollowed organizer' : 'Now following organizer!');
    },
    onError: (error) => {
      toast.error('Failed to update follow status: ' + error.message);
    },
  });
}

export function useCreateOrganizerProfile() {
  const queryClient = useQueryClient();
  const { user, refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async (profileData: {
      name: string;
      description?: string;
      contact_email?: string;
      contact_phone?: string;
      logo_url?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('organizer_profiles')
        .insert({
          ...profileData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizers'] });
      refreshProfile();
      toast.success('Organizer profile created!');
    },
    onError: (error) => {
      toast.error('Failed to create organizer profile: ' + error.message);
    },
  });
}

export function useUpdateOrganizerProfile() {
  const queryClient = useQueryClient();
  const { refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async ({
      profileId,
      updates,
    }: {
      profileId: string;
      updates: Partial<OrganizerProfile>;
    }) => {
      const { data, error } = await supabase
        .from('organizer_profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organizers'] });
      queryClient.invalidateQueries({ queryKey: ['organizer', data.id] });
      refreshProfile();
      toast.success('Organizer profile updated!');
    },
    onError: (error) => {
      toast.error('Failed to update organizer profile: ' + error.message);
    },
  });
}
