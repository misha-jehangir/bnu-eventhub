import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizerEvents } from '@/hooks/useEvents';
import { useEffect } from 'react';

export default function MyEventsPage() {
  const navigate = useNavigate();
  const { profile, organizerProfile, isLoading: authLoading } = useAuth();
  const { data: events, isLoading: eventsLoading } = useOrganizerEvents(organizerProfile?.id);

  // Redirect if not an organizer
  useEffect(() => {
    if (!authLoading && (!profile || profile.role !== 'organizer')) {
      navigate('/');
    }
  }, [profile, authLoading, navigate]);

  // Redirect if no organizer profile
  useEffect(() => {
    if (!authLoading && profile?.role === 'organizer' && !organizerProfile) {
      navigate('/organizer-profile');
    }
  }, [profile, organizerProfile, authLoading, navigate]);

  const getEventStatus = (event: { event_date: string; is_cancelled: boolean }) => {
    if (event.is_cancelled) return { label: 'Cancelled', variant: 'destructive' as const };
    const isPast = new Date(event.event_date) < new Date();
    if (isPast) return { label: 'Archived', variant: 'secondary' as const };
    return { label: 'Upcoming', variant: 'default' as const };
  };

  if (authLoading || eventsLoading) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold">My Events</h1>
              <p className="text-muted-foreground mt-1">
                {events?.length || 0} events
              </p>
            </div>
            <Button
              onClick={() => navigate('/create-event')}
              className="bg-gradient-primary"
            >
              Create Event
            </Button>
          </div>

          {events && events.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {events.map((event) => {
                    const status = getEventStatus(event);
                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/event/${event.id}`)}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{event.title}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{format(new Date(event.event_date), 'MMM d, yyyy • h:mm a')}</span>
                          </div>
                        </div>
                        <Badge variant={status.variant} className="ml-4 flex-shrink-0">
                          {status.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No Events Yet</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                  Create your first event to start engaging with students.
                </p>
                <Button
                  onClick={() => navigate('/create-event')}
                  className="mt-4 bg-gradient-primary"
                >
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
