import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Star,
  Check,
  Edit,
  Trash2,
  XCircle,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RsvpButtons } from '@/components/events/RsvpButtons';
import { useEvent, useEventRsvpCount, useEventPosts, useCancelEvent, useDeleteEvent } from '@/hooks/useEvents';
import { useFollowStatus, useFollowerCount, useToggleFollow } from '@/hooks/useOrganizers';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const eventTypeBadgeClass: Record<string, string> = {
  academic: 'badge-academic',
  social: 'badge-social',
  sports: 'badge-sports',
  cultural: 'badge-cultural',
  workshop: 'badge-workshop',
  career: 'badge-career',
  other: 'badge-other',
};

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, profile, organizerProfile } = useAuth();

  const { data: event, isLoading } = useEvent(eventId!);
  const { data: rsvpCount } = useEventRsvpCount(eventId!);
  const { data: posts } = useEventPosts(eventId!);
  const { data: isFollowing } = useFollowStatus(event?.organizer?.id || '');
  const { data: followerCount } = useFollowerCount(event?.organizer?.id || '');
  const { mutate: toggleFollow, isPending: isTogglingFollow } = useToggleFollow();
  const { mutate: cancelEvent, isPending: isCancelling } = useCancelEvent();
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();

  const isOwner = organizerProfile?.id === event?.organizer_id;
  const isStudent = profile?.role === 'student';
  const isPast = event ? new Date(event.event_date) < new Date() : false;

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video rounded-xl" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <Button onClick={() => navigate('/')}>Back to Events</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event poster */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video rounded-xl overflow-hidden bg-muted"
            >
              {event.poster_url ? (
                <img
                  src={event.poster_url}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-primary">
                  <Calendar className="h-20 w-20 text-primary-foreground opacity-50" />
                </div>
              )}

              {/* Status badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={cn('border text-sm', eventTypeBadgeClass[event.event_type])}>
                  {event.event_type}
                </Badge>
              </div>

              {event.is_cancelled && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="text-center">
                    <XCircle className="h-16 w-16 mx-auto text-destructive mb-2" />
                    <p className="text-2xl font-bold text-destructive">Event Cancelled</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Event info */}
            <div>
              {isPast && !event.is_cancelled && (
                <Badge variant="secondary" className="mb-3">Past Event</Badge>
              )}
              
              <h1 className="font-display text-3xl md:text-4xl font-bold">{event.title}</h1>

              <div className="mt-4 flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{format(new Date(event.event_date), 'h:mm a')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{event.venue}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-3">About this event</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Event posts/updates */}
            {posts && posts.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Updates
                  </h2>
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Card key={post.id} className="bg-muted/50">
                        <CardContent className="pt-4">
                          <p className="whitespace-pre-wrap">{post.content}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {format(new Date(post.created_at), 'MMM d, yyyy • h:mm a')}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* RSVP Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>RSVP</span>
                  <div className="flex items-center gap-3 text-sm font-normal text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>{rsvpCount?.interested_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      <span>{rsvpCount?.going_count || 0}</span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RsvpButtons
                  eventId={event.id}
                  disabled={event.is_cancelled || isPast}
                />
                {(event.is_cancelled || isPast) && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {event.is_cancelled
                      ? "This event has been cancelled."
                      : "This event has already passed."}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Organizer Card */}
            {event.organizer && (
              <Card>
                <CardHeader>
                  <CardTitle>Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link to={`/organizer/${event.organizer.id}`} className="flex items-center gap-3 group">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={event.organizer.logo_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {event.organizer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold group-hover:text-primary transition-colors">
                        {event.organizer.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {followerCount || 0} followers
                      </p>
                    </div>
                  </Link>

                  {user && isStudent && (
                    <Button
                      variant={isFollowing ? 'outline' : 'default'}
                      className={cn('w-full mt-4', !isFollowing && 'bg-gradient-primary')}
                      onClick={() => toggleFollow({ organizerId: event.organizer!.id, isFollowing: !!isFollowing })}
                      disabled={isTogglingFollow}
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Owner actions */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => navigate(`/edit-event/${event.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Event
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => navigate(`/event/${event.id}/rsvps`)}
                  >
                    <Users className="h-4 w-4" />
                    View RSVPs
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => navigate(`/event/${event.id}/post`)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Post Update
                  </Button>

                  {!event.is_cancelled && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full gap-2 text-warning border-warning/50 hover:bg-warning/10">
                          <AlertTriangle className="h-4 w-4" />
                          Cancel Event
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel this event?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will notify all users who have RSVP'd. The event will be marked as cancelled.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Event</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => cancelEvent(event.id)}
                            disabled={isCancelling}
                            className="bg-warning text-warning-foreground hover:bg-warning/90"
                          >
                            Cancel Event
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/50 hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                        Delete Event
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. All users who have RSVP'd will be notified.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            deleteEvent({ eventId: event.id, eventTitle: event.title });
                            navigate('/');
                          }}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Event
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
