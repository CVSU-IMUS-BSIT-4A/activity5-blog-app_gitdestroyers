import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { listPosts, updateUser, uploadAvatar } from '../api';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useClickOutside } from '../hooks/useClickOutside';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';
import {
  Calendar,
  Edit,
  LogOut,
  ArrowLeft,
  Check,
  X,
  Camera,
  ChevronDown,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import NotificationButton from './NotificationButton';
import SettingsDialog from './SettingsDialog';
import { useSettingsDialog } from '../hooks/useSettingsDialog';
import type { Post } from '../api';

const MAX_TITLE_CHARS = 50; 
function truncateTitle(title: string, max = MAX_TITLE_CHARS) {
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}

function PostContentPreview({ content, postId }: { content: string; postId: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 200;
  const shouldTruncate = content.length > MAX_LENGTH;

  if (!shouldTruncate) {
    return (
      <p className="text-foreground leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere">
        {content}
      </p>
    );
  }

  return (
    <div className="w-full">
      <p className="text-foreground leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere">
        {isExpanded ? content : `${content.slice(0, MAX_LENGTH)}...`}
      </p>
      <Button
        variant="link"
        size="sm"
        className="p-0 h-auto text-primary hover:text-primary/80"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'See less' : 'See more'}
      </Button>
    </div>
  );
}

export default function Profile() {
  const { currentUser, userId, handleLogout, loading } = useCurrentUser();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  useDocumentTitle(currentUser?.name ? `${currentUser.name}'s Profile` : 'Profile');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { ref: profileDropdownRef } = useClickOutside(() => setShowProfileDropdown(false));
  const { open, setOpen, openDialog } = useSettingsDialog();

  useEffect(() => {
    loadUserPosts();
  }, [userId, currentUser, loading]);

  async function loadUserPosts() {
    if (!userId) return;

    try {
      setPostsLoading(true);
      const response = await listPosts();
      const filteredPosts = response.data.filter((post: Post) => post.author?.id === userId);
      setUserPosts(filteredPosts);
    } catch (err) {
      console.error('Failed to load user posts:', err);
    } finally {
      setPostsLoading(false);
    }
  }

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditBio(currentUser?.bio || '');
    setEditAvatar(null);
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditBio('');
    setEditAvatar(null);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setEditAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    setError(null);

    try {
      let bioUpdated = false;
      let avatarUpdated = false;

      const updateData: Record<string, unknown> = {};
      if (editBio !== currentUser.bio) {
        updateData.bio = editBio;
        bioUpdated = true;
      }

      if (Object.keys(updateData).length > 0) {
        await updateUser(currentUser.id, updateData);
      }

      const fileInput = fileInputRef.current;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        await uploadAvatar(currentUser.id, file);
        avatarUpdated = true;
      }

      if (bioUpdated || avatarUpdated) {
        toast.success('Profile updated successfully!', {
          description: 'Your profile has been saved.'
        });
      }

      setIsEditing(false);
      setEditBio('');
      setEditAvatar(null);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to update profile';
      setError(errorMessage);

      toast.error('Failed to update profile', {
        description: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Posts
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications Button */}
            <NotificationButton userId={userId} />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-2 flex items-center gap-2"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                  {currentUser?.avatar ? (
                    <img
                      src={`http://localhost:3005${currentUser.avatar}`}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : currentUser?.name ? (
                    currentUser.name.charAt(0).toUpperCase()
                  ) : currentUser?.email ? (
                    currentUser.email.charAt(0).toUpperCase()
                  ) : (
                    'U'
                  )}
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showProfileDropdown && (
                <div className="absolute right-0 top-11 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="p-1 space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        openDialog();
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                    <div className="border-t my-1"></div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl overflow-hidden">
                  {editAvatar ? (
                    <img
                      src={editAvatar}
                      alt="Avatar Preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : currentUser?.avatar ? (
                    <img
                      src={`http://localhost:3005${currentUser.avatar}`}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : currentUser?.name ? (
                    currentUser.name.charAt(0).toUpperCase()
                  ) : currentUser?.email ? (
                    currentUser.email.charAt(0).toUpperCase()
                  ) : (
                    'U'
                  )}
                </div>
                {isEditing && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-1 -right-1 h-8 w-8 p-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">
                    {currentUser?.name || 'No Name Set'}
                  </CardTitle>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      onClick={handleStartEdit}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-4 mb-4">
                    <Textarea
                      placeholder="Tell others about yourself..."
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="min-h-20"
                    />

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </div>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground mb-4">
                    {currentUser?.bio || 'No bio available. Add a bio to tell others about yourself!'}
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {currentUser?.created_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(currentUser.created_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userPosts.length}</div>
                <div className="text-sm text-muted-foreground">Total Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {userPosts.reduce((total, post) => total + (post.comments?.length || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Comments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {userPosts.reduce((total, post) => total + (post.comments?.length || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Interactions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Posts</h2>
            <Badge variant="secondary">{userPosts.length} posts</Badge>
          </div>

          {postsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : userPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Edit className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p>You haven't created any posts yet. Start sharing your thoughts!</p>
                </div>
                <Button asChild>
                  <Link to="/">Create Your First Post</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-2">
                          <Link
                            to={`/post/${post.id}`}
                            className="text-primary hover:underline hover:text-primary/80 transition-colors block line-clamp-2 break-words"
                            title={post.title}
                          >
                            {truncateTitle(post.title)}
                          </Link>
                        </CardTitle>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0">
                        {post.comments?.length || 0} comments
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="overflow-hidden">
                    <PostContentPreview content={post.content} postId={post.id} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings Dialog mounted at page root for access from header */}
      <SettingsDialog open={open} onOpenChange={setOpen} hideTrigger />
    </div>
  );
}
