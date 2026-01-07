import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/events/ImageUpload';
import { useEvent, useUpdateEvent } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { EventType } from '@/types/database';
import { format } from 'date-fns';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description is too long'),
  venue: z.string().min(3, 'Venue must be at least 3 characters').max(200, 'Venue is too long'),
  event_date: z.string().min(1, 'Date and time is required'),
  event_type: z.enum(['academic', 'social', 'sports', 'cultural', 'workshop', 'career', 'other']),
});

type EventFormValues = z.infer<typeof eventSchema>;

const eventTypes: EventType[] = ['academic', 'social', 'sports', 'cultural', 'workshop', 'career', 'other'];

export default function EditEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { organizerProfile } = useAuth();
  const { data: event, isLoading: eventLoading } = useEvent(eventId!);
  const { mutate: updateEvent, isPending } = useUpdateEvent();
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      venue: '',
      event_date: '',
      event_type: 'other',
    },
  });

  // Check ownership
  useEffect(() => {
    if (event && organizerProfile && event.organizer_id !== organizerProfile.id) {
      navigate(`/event/${eventId}`);
    }
  }, [event, organizerProfile, eventId, navigate]);

  // Populate form
  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        description: event.description,
        venue: event.venue,
        event_date: format(new Date(event.event_date), "yyyy-MM-dd'T'HH:mm"),
        event_type: event.event_type,
      });
      setPosterUrl(event.poster_url || null);
    }
  }, [event, form]);

  const onSubmit = (values: EventFormValues) => {
    updateEvent(
      {
        eventId: eventId!,
        updates: {
          title: values.title,
          description: values.description,
          venue: values.venue,
          event_date: new Date(values.event_date).toISOString(),
          event_type: values.event_type,
          poster_url: posterUrl,
        },
      },
      {
        onSuccess: () => {
          navigate(`/event/${eventId}`);
        },
      }
    );
  };

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
      <div className="container py-8 max-w-2xl">
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
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                  <Edit className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Edit Event</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Annual Tech Conference 2024"
                    {...form.register('title')}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event..."
                    rows={5}
                    {...form.register('description')}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue *</Label>
                    <Input
                      id="venue"
                      placeholder="e.g., Main Auditorium"
                      {...form.register('venue')}
                    />
                    {form.formState.errors.venue && (
                      <p className="text-sm text-destructive">{form.formState.errors.venue.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_type">Event Type *</Label>
                    <Select
                      value={form.watch('event_type')}
                      onValueChange={(value) => form.setValue('event_type', value as EventType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type} value={type} className="capitalize">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_date">Date & Time *</Label>
                  <Input
                    id="event_date"
                    type="datetime-local"
                    {...form.register('event_date')}
                  />
                  {form.formState.errors.event_date && (
                    <p className="text-sm text-destructive">{form.formState.errors.event_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Event Poster (optional)</Label>
                  <ImageUpload
                    value={posterUrl}
                    onChange={setPosterUrl}
                    disabled={isPending}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-gradient-primary"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
