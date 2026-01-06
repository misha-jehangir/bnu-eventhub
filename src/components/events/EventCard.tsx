import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event, OrganizerProfile } from '@/types/database';
import { useEventRsvpCount } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event & { organizer?: OrganizerProfile };
  index?: number;
}

const eventTypeBadgeClass: Record<string, string> = {
  academic: 'badge-academic',
  social: 'badge-social',
  sports: 'badge-sports',
  cultural: 'badge-cultural',
  workshop: 'badge-workshop',
  career: 'badge-career',
  other: 'badge-other',
};

export function EventCard({ event, index = 0 }: EventCardProps) {
  const { data: rsvpCount } = useEventRsvpCount(event.id);
  const isPast = new Date(event.event_date) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/event/${event.id}`}>
        <Card className={cn(
          'group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 card-gradient border',
          event.is_cancelled && 'opacity-60',
          isPast && 'opacity-75'
        )}>
          {/* Event Poster */}
          <div className="relative aspect-[16/9] overflow-hidden bg-muted">
            {event.poster_url ? (
              <img
                src={event.poster_url}
                alt={event.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-primary">
                <Calendar className="h-12 w-12 text-primary-foreground opacity-50" />
              </div>
            )}
            
            {/* Status badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className={cn('border', eventTypeBadgeClass[event.event_type])}>
                {event.event_type}
              </Badge>
            </div>
            
            {event.is_cancelled && (
              <div className="absolute top-3 right-3">
                <Badge variant="destructive">Cancelled</Badge>
              </div>
            )}
            
            {isPast && !event.is_cancelled && (
              <div className="absolute top-3 right-3">
                <Badge variant="secondary">Past Event</Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            {/* Date */}
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(event.event_date), 'EEE, MMM d • h:mm a')}</span>
            </div>

            {/* Title */}
            <h3 className="font-display text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>

            {/* Venue */}
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          </CardContent>

          <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
            {/* Organizer */}
            {event.organizer && (
              <span className="text-sm text-muted-foreground line-clamp-1">
                by {event.organizer.name}
              </span>
            )}

            {/* RSVP Count */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{(rsvpCount?.interested_count || 0) + (rsvpCount?.going_count || 0)}</span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
