import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Building2, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateOrganizerProfile, useUpdateOrganizerProfile } from '@/hooks/useOrganizers';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional(),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  contact_phone: z.string().max(20).optional(),
  logo_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function OrganizerProfilePage() {
  const navigate = useNavigate();
  const { profile, organizerProfile, isLoading: authLoading } = useAuth();
  const { mutate: createProfile, isPending: isCreating } = useCreateOrganizerProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateOrganizerProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', description: '', contact_email: '', contact_phone: '', logo_url: '' },
  });

  useEffect(() => {
    if (!authLoading && profile?.role !== 'organizer') navigate('/');
  }, [profile, authLoading, navigate]);

  useEffect(() => {
    if (organizerProfile) {
      form.reset({
        name: organizerProfile.name,
        description: organizerProfile.description || '',
        contact_email: organizerProfile.contact_email || '',
        contact_phone: organizerProfile.contact_phone || '',
        logo_url: organizerProfile.logo_url || '',
      });
    }
  }, [organizerProfile, form]);

  const onSubmit = (values: ProfileFormValues) => {
    const profileData = {
      name: values.name,
      description: values.description,
      contact_email: values.contact_email,
      contact_phone: values.contact_phone,
      logo_url: values.logo_url,
    };
    if (organizerProfile) {
      updateProfile({ profileId: organizerProfile.id, updates: profileData }, { onSuccess: () => navigate('/') });
    } else {
      createProfile(profileData, { onSuccess: () => navigate('/') });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle>{organizerProfile ? 'Edit' : 'Create'} Organizer Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input id="name" {...form.register('name')} />
                  {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={4} {...form.register('description')} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input id="contact_email" type="email" {...form.register('contact_email')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input id="contact_phone" {...form.register('contact_phone')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input id="logo_url" type="url" {...form.register('logo_url')} />
                </div>
                <Button type="submit" disabled={isPending} className="w-full bg-gradient-primary">
                  {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
