import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EventCard } from '@/components/events/EventCard';
import { useOrganizer, useFollowStatus, useFollowerCount, useToggleFollow } from '@/hooks/useOrganizers';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function OrganizerDetailPage() {
  const { organizerId } = useParams<{ organizerId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: organizer, isLoading } = useOrganizer(organizerId!);
  const { data: events } = useEvents({ organizerId, showArchived: true });
  const { data: isFollowing } = useFollowStatus(organizerId!);
  const { data: followerCount } = useFollowerCount(organizerId!);
  const { mutate: toggleFollow, isPending } = useToggleFollow();

  const isStudent = profile?.role === 'student';

  if (isLoading) {
    return <Layout><div className="container py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  if (!organizer) {
    return <Layout><div className="container py-16 text-center"><h1 className="text-2xl font-bold mb-4">Organizer Not Found</h1><Button onClick={() => navigate('/')}>Back</Button></div></Layout>;
  }

  return (
    <Layout>
      <div className="container py-8">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Back</Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-xl bg-card border">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={organizer.logo_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">{organizer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold">{organizer.name}</h1>
              {organizer.description && <p className="text-muted-foreground mt-2">{organizer.description}</p>}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" />{followerCount || 0} followers</span>
                {organizer.contact_email && <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{organizer.contact_email}</span>}
                {organizer.contact_phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{organizer.contact_phone}</span>}
              </div>
            </div>
            {user && isStudent && (
              <Button variant={isFollowing ? 'outline' : 'default'} className={cn(!isFollowing && 'bg-gradient-primary')} onClick={() => toggleFollow({ organizerId: organizer.id, isFollowing: !!isFollowing })} disabled={isPending}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
        </motion.div>
        <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2"><Calendar className="h-6 w-6" />Events by {organizer.name}</h2>
        {events && events.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{events.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}</div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">No events yet</div>
        )}
      </div>
    </Layout>
  );
}
