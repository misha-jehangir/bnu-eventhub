import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters } from '@/components/events/EventFilters';
import { useEvents } from '@/hooks/useEvents';
import { useOrganizers, useUserFollowedOrganizerIds } from '@/hooks/useOrganizers';
import { useUserRsvpEventIds } from '@/hooks/useRsvps';
import { useAuth } from '@/contexts/AuthContext';
import { EventType } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { user } = useAuth();
  const [eventType, setEventType] = useState<EventType | undefined>();
  const [organizerId, setOrganizerId] = useState<string | undefined>();
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFollowed, setOnlyFollowed] = useState(false);
  const [onlyRsvpd, setOnlyRsvpd] = useState(false);

  const { data: events, isLoading: eventsLoading } = useEvents({
    eventType,
    organizerId,
    showArchived,
  });
  const { data: organizers } = useOrganizers();
  const { data: followedOrganizerIds } = useUserFollowedOrganizerIds();
  const { data: rsvpEventIds } = useUserRsvpEventIds();

  // Apply client-side filters
  const filteredEvents = useMemo(() => {
    if (!events) return [];

    return events.filter((event) => {
      // Search filter (case-insensitive title match)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!event.title.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Only followed organizers filter
      if (onlyFollowed && followedOrganizerIds) {
        if (!followedOrganizerIds.includes(event.organizer_id)) {
          return false;
        }
      }

      // Only RSVP'd events filter
      if (onlyRsvpd && rsvpEventIds) {
        if (!rsvpEventIds.includes(event.id)) {
          return false;
        }
      }

      return true;
    });
  }, [events, searchQuery, onlyFollowed, followedOrganizerIds, onlyRsvpd, rsvpEventIds]);

  const clearFilters = () => {
    setEventType(undefined);
    setOrganizerId(undefined);
    setShowArchived(false);
    setSearchQuery('');
    setOnlyFollowed(false);
    setOnlyRsvpd(false);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Discover What's Happening on Campus</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Your Campus Life,{' '}
              <span className="text-gradient-primary">Amplified</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Find and RSVP to the best events at BNU. From academic workshops to social gatherings, 
              never miss out on what matters to you.
            </p>
            {!user && (
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="bg-gradient-primary glow-primary">
                    Get Started — It's Free
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 rounded-full bg-gradient-primary opacity-5 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 rounded-full bg-gradient-accent opacity-5 blur-3xl" />
      </section>

      {/* Events Section */}
      <section className="container py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              Upcoming Events
            </h2>
            <p className="text-muted-foreground mt-1">
              {filteredEvents.length} events to explore
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <EventFilters
            eventType={eventType}
            organizerId={organizerId}
            showArchived={showArchived}
            organizers={organizers || []}
            searchQuery={searchQuery}
            onlyFollowed={onlyFollowed}
            onlyRsvpd={onlyRsvpd}
            showPersonalFilters={!!user}
            onEventTypeChange={setEventType}
            onOrganizerChange={setOrganizerId}
            onShowArchivedChange={setShowArchived}
            onSearchQueryChange={setSearchQuery}
            onOnlyFollowedChange={setOnlyFollowed}
            onOnlyRsvpdChange={setOnlyRsvpd}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Events Grid */}
        {eventsLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card">
                <Skeleton className="aspect-[16/9]" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <Calendar className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No Events Found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              {showArchived
                ? "There are no events matching your filters."
                : "There are no upcoming events right now. Check back soon!"}
            </p>
          </motion.div>
        )}
      </section>
    </Layout>
  );
}
