import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { getPost } from '../api';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useClickOutside } from '../hooks/useClickOutside';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, ChevronDown, Settings, LogOut } from 'lucide-react';
import PostCard from './PostCard';
import { toast } from 'sonner';
import NotificationButton from './NotificationButton';
import SettingsDialog from './SettingsDialog';
import { useSettingsDialog } from '../hooks/useSettingsDialog';
import type { Post } from '../api';


export default function Post() {
  const { postId } = useParams<{ postId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, userId, handleLogout } = useCurrentUser();
  const { open, setOpen, openDialog } = useSettingsDialog();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { ref: profileDropdownRef } = useClickOutside(() => setShowProfileDropdown(false));
  
  // Get comment ID from URL query parameters
  const highlightCommentId = searchParams.get('comment') ? parseInt(searchParams.get('comment')!) : undefined;

  // Set page title based on post
  useDocumentTitle(post?.title || 'Loading...');

  async function loadPost() {
    if (!postId) return;
    
    try {
      setLoading(true);
      const postData = await getPost(parseInt(postId));
      setPost(postData);
    } catch (error) {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPost();
  }, [postId]);

  if (!postId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Post Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/">Back to Posts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Loading post...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Post Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist or has been deleted.</p>
            <Button asChild>
              <Link to="/">Back to Posts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Posts
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
                  ) : (
                    userId ? String.fromCharCode(65 + (userId % 26)) : 'U'
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
                        navigate('/profile');
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      Profile
                    </Button>
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

        {/* Post Content */}
        <div className="space-y-6">
          <PostCard
            post={post}
            userId={userId || undefined}
            currentUserAvatar={currentUser?.avatar}
            onUpdate={(postId, updatedPost) => setPost(updatedPost)} 
            onDelete={() => navigate('/')} 
            onCommentAdded={() => loadPost()} 
            autoOpenComments={true}
            disableDialog={true} 
            truncateContent={false}
            highlightCommentId={highlightCommentId} 
          />
        </div>
      </div>

      {/* Settings Dialog mounted at page root for access from header */}
      <SettingsDialog open={open} onOpenChange={setOpen} hideTrigger />
    </div>
  );
}

