import { EventType } from '@/types/database';
import { OrganizerProfile } from '@/types/database';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';

interface EventFiltersProps {
  eventType: EventType | undefined;
  organizerId: string | undefined;
  showArchived: boolean;
  organizers: OrganizerProfile[];
  onEventTypeChange: (type: EventType | undefined) => void;
  onOrganizerChange: (id: string | undefined) => void;
  onShowArchivedChange: (show: boolean) => void;
  onClearFilters: () => void;
}

const eventTypes: EventType[] = ['academic', 'social', 'sports', 'cultural', 'workshop', 'career', 'other'];

export function EventFilters({
  eventType,
  organizerId,
  showArchived,
  organizers,
  onEventTypeChange,
  onOrganizerChange,
  onShowArchivedChange,
  onClearFilters,
}: EventFiltersProps) {
  const hasFilters = eventType || organizerId || showArchived;

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filters</span>
      </div>

      <Select
        value={eventType || 'all'}
        onValueChange={(value) => onEventTypeChange(value === 'all' ? undefined : value as EventType)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Event Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {eventTypes.map((type) => (
            <SelectItem key={type} value={type} className="capitalize">
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={organizerId || 'all'}
        onValueChange={(value) => onOrganizerChange(value === 'all' ? undefined : value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Organizer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Organizers</SelectItem>
          {organizers.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Switch
          id="show-archived"
          checked={showArchived}
          onCheckedChange={onShowArchivedChange}
        />
        <Label htmlFor="show-archived" className="text-sm">
          Show past events
        </Label>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
