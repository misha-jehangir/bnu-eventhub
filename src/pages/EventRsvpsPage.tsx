import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Users, Star, Check, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEvent, useEventRsvpCount } from '@/hooks/useEvents';
import { useEventRsvps } from '@/hooks/useRsvps';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function EventRsvpsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { organizerProfile } = useAuth();
  const { data: event, isLoading: eventLoading } = useEvent(eventId!);
  const { data: rsvpCount } = useEventRsvpCount(eventId!);
  const { data: rsvps, isLoading: rsvpsLoading } = useEventRsvps(eventId!);

  // Check ownership
  useEffect(() => {
    if (event && organizerProfile && event.organizer_id !== organizerProfile.id) {
      navigate(`/event/${eventId}`);
    }
  }, [event, organizerProfile, eventId, navigate]);

  const interestedRsvps = rsvps?.filter((r) => r.status === 'interested') || [];
  const goingRsvps = rsvps?.filter((r) => r.status === 'going') || [];

  if (eventLoading) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      <div className="container py-8 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate(`/event/${eventId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Event
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">RSVP Analytics</CardTitle>
                  <p className="text-sm text-muted-foreground">{event.title}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-bold">{(rsvpCount?.interested_count || 0) + (rsvpCount?.going_count || 0)}</p>
                  <p className="text-sm text-muted-foreground">Total RSVPs</p>
                </div>
                <div className="p-4 rounded-lg bg-warning/10">
                  <p className="text-3xl font-bold text-warning">{rsvpCount?.interested_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Interested</p>
                </div>
                <div className="p-4 rounded-lg bg-success/10">
                  <p className="text-3xl font-bold text-success">{rsvpCount?.going_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Going</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="all">All ({rsvps?.length || 0})</TabsTrigger>
                  <TabsTrigger value="interested" className="gap-1">
                    <Star className="h-4 w-4" />
                    Interested ({interestedRsvps.length})
                  </TabsTrigger>
                  <TabsTrigger value="going" className="gap-1">
                    <Check className="h-4 w-4" />
                    Going ({goingRsvps.length})
                  </TabsTrigger>
                </TabsList>

                {rsvpsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <TabsContent value="all">
                      <RsvpList rsvps={rsvps || []} />
                    </TabsContent>
                    <TabsContent value="interested">
                      <RsvpList rsvps={interestedRsvps} />
                    </TabsContent>
                    <TabsContent value="going">
                      <RsvpList rsvps={goingRsvps} />
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}

function RsvpList({ rsvps }: { rsvps: any[] }) {
  if (rsvps.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No RSVPs yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rsvps.map((rsvp) => (
        <div key={rsvp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={rsvp.profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {rsvp.profile?.full_name?.charAt(0) || rsvp.profile?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{rsvp.profile?.full_name || 'User'}</p>
              <p className="text-sm text-muted-foreground">{rsvp.profile?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={rsvp.status === 'going' ? 'default' : 'secondary'} className={rsvp.status === 'going' ? 'bg-success' : 'bg-warning text-warning-foreground'}>
              {rsvp.status === 'going' ? (
                <><Check className="h-3 w-3 mr-1" /> Going</>
              ) : (
                <><Star className="h-3 w-3 mr-1" /> Interested</>
              )}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(new Date(rsvp.created_at), 'MMM d')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
