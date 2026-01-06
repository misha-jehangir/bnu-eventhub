import { Button } from '@/components/ui/button';
import { RsvpStatus } from '@/types/database';
import { useUserRsvp, useSetRsvp, useRemoveRsvp } from '@/hooks/useRsvps';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RsvpButtonsProps {
  eventId: string;
  disabled?: boolean;
}

export function RsvpButtons({ eventId, disabled }: RsvpButtonsProps) {
  const { user } = useAuth();
  const { data: userRsvp, isLoading } = useUserRsvp(eventId);
  const { mutate: setRsvp, isPending: isSettingRsvp } = useSetRsvp();
  const { mutate: removeRsvp, isPending: isRemovingRsvp } = useRemoveRsvp();

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        Sign in to RSVP to this event
      </p>
    );
  }

  const handleRsvp = (status: RsvpStatus) => {
    if (userRsvp?.status === status) {
      removeRsvp(eventId);
    } else {
      setRsvp({ eventId, status });
    }
  };

  const isPending = isSettingRsvp || isRemovingRsvp || isLoading;

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant={userRsvp?.status === 'interested' ? 'default' : 'outline'}
        onClick={() => handleRsvp('interested')}
        disabled={disabled || isPending}
        className={cn(
          'gap-2 transition-all',
          userRsvp?.status === 'interested' && 'bg-warning text-warning-foreground hover:bg-warning/90'
        )}
      >
        <Star className={cn('h-4 w-4', userRsvp?.status === 'interested' && 'fill-current')} />
        Interested
      </Button>
      
      <Button
        variant={userRsvp?.status === 'going' ? 'default' : 'outline'}
        onClick={() => handleRsvp('going')}
        disabled={disabled || isPending}
        className={cn(
          'gap-2 transition-all',
          userRsvp?.status === 'going' && 'bg-success text-success-foreground hover:bg-success/90'
        )}
      >
        <Check className={cn('h-4 w-4', userRsvp?.status === 'going' && 'fill-current')} />
        Going
      </Button>

      {userRsvp && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeRsvp(eventId)}
          disabled={isPending}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
