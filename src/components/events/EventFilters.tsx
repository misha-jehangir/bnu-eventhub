import { EventType } from '@/types/database';
import { OrganizerProfile } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Filter, X, Search } from 'lucide-react';

interface EventFiltersProps {
  eventType: EventType | undefined;
  organizerId: string | undefined;
  showArchived: boolean;
  organizers: OrganizerProfile[];
  searchQuery: string;
  onlyFollowed: boolean;
  onlyRsvpd: boolean;
  showPersonalFilters: boolean;
  onEventTypeChange: (type: EventType | undefined) => void;
  onOrganizerChange: (id: string | undefined) => void;
  onShowArchivedChange: (show: boolean) => void;
  onSearchQueryChange: (query: string) => void;
  onOnlyFollowedChange: (only: boolean) => void;
  onOnlyRsvpdChange: (only: boolean) => void;
  onClearFilters: () => void;
}

const eventTypes: EventType[] = ['academic', 'social', 'sports', 'cultural', 'workshop', 'career', 'other'];

export function EventFilters({
  eventType,
  organizerId,
  showArchived,
  organizers,
  searchQuery,
  onlyFollowed,
  onlyRsvpd,
  showPersonalFilters,
  onEventTypeChange,
  onOrganizerChange,
  onShowArchivedChange,
  onSearchQueryChange,
  onOnlyFollowedChange,
  onOnlyRsvpdChange,
  onClearFilters,
}: EventFiltersProps) {
  const hasFilters = eventType || organizerId || showArchived || searchQuery || onlyFollowed || onlyRsvpd;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events by name"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="pl-9"
        />
      </div>

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
            Past events
          </Label>
        </div>

        {showPersonalFilters && (
          <>
            <div className="flex items-center gap-2">
              <Switch
                id="only-followed"
                checked={onlyFollowed}
                onCheckedChange={onOnlyFollowedChange}
              />
              <Label htmlFor="only-followed" className="text-sm">
                Followed only
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="only-rsvpd"
                checked={onlyRsvpd}
                onCheckedChange={onOnlyRsvpdChange}
              />
              <Label htmlFor="only-rsvpd" className="text-sm">
                My RSVPs
              </Label>
            </div>
          </>
        )}

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
    </div>
  );
}
