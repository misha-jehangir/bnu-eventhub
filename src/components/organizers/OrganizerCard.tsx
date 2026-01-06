import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OrganizerProfile } from '@/types/database';
import { useFollowStatus, useFollowerCount, useToggleFollow } from '@/hooks/useOrganizers';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Mail, Phone, UserPlus, UserMinus } from 'lucide-react';

interface OrganizerCardProps {
  organizer: OrganizerProfile;
  showFollowButton?: boolean;
  index?: number;
}

export function OrganizerCard({ organizer, showFollowButton = true, index = 0 }: OrganizerCardProps) {
  const { user, profile } = useAuth();
  const { data: isFollowing } = useFollowStatus(organizer.id);
  const { data: followerCount } = useFollowerCount(organizer.id);
  const { mutate: toggleFollow, isPending } = useToggleFollow();

  const canFollow = user && profile?.role === 'student';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md card-gradient">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Link to={`/organizer/${organizer.id}`}>
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={organizer.logo_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {organizer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <Link to={`/organizer/${organizer.id}`}>
                <h3 className="font-display text-lg font-semibold hover:text-primary transition-colors">
                  {organizer.name}
                </h3>
              </Link>
              
              {organizer.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {organizer.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{followerCount || 0} followers</span>
                </div>
                
                {organizer.contact_email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{organizer.contact_email}</span>
                  </div>
                )}
              </div>
            </div>

            {showFollowButton && canFollow && (
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                size="sm"
                onClick={() => toggleFollow({ organizerId: organizer.id, isFollowing: !!isFollowing })}
                disabled={isPending}
                className={isFollowing ? '' : 'bg-gradient-primary'}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="mr-1 h-4 w-4" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-1 h-4 w-4" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
