import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { listPosts } from '../api';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import PostCard from './PostCard';
import type { Post } from '../api';

interface User {
  id: number;
  name?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  created_at?: string;
}

interface FeedProps {
  userId?: number;
  currentUser?: User | null;
  onUpdatePost?: (postId: number, updatedPost: Post) => void;
  onDeletePost?: (postId: number) => void;
  onCommentAdded?: () => void;
}

export interface FeedRef {
  refresh: () => Promise<void>;
  scrollToTop: () => void;
}

const Feed = forwardRef<FeedRef, FeedProps>(({
  userId,
  currentUser,
  onUpdatePost,
  onDeletePost,
  onCommentAdded,
}, ref) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const pageSize = 5;

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    refresh: async () => {
      setIsRefreshing(true);
      setPage(1);
      try {
        setLoading(true);
        setBackendAvailable(true);
        const data = await listPosts(1, pageSize);
        setPosts(Array.isArray(data?.data) ? data.data : []);
        setHasMore(data?.data?.length >= pageSize);
      } catch (error) {
        setBackendAvailable(false);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    scrollToTop: () => {
      feedRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  }));

  async function load() {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setBackendAvailable(true);
      const payload = await listPosts(page, pageSize);
      const newItems = Array.isArray(payload?.data) ? payload.data : [];

      if (page === 1) {
        setPosts(newItems);
      } else {
        setPosts((prev) => [...prev, ...newItems]);
      }

      setHasMore(newItems.length >= pageSize);
    } catch (error) {
      setBackendAvailable(false);
      return;
    } finally {
      if (page === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loading || loadingMore || !backendAvailable) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 300;
      if (scrollPosition >= threshold) {
        setPage((p) => p + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, loadingMore, backendAvailable]);

  return (
    <div ref={feedRef} className="space-y-6">
      {/* Backend unavailable message - Top */}
      {!backendAvailable && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-destructive">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                <p className="text-sm font-medium">
                  Unable to connect to the server. Please check your connection and try again.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBackendAvailable(true);
                  setLoading(true);
                  load();
                }}
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      {loading || !backendAvailable ? (
        Array.from({ length: 3 }).map((_, i) => (
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
        ))
       ) : (
         posts.map((post) => (
           <PostCard
             key={`main-${post.id}`}
             post={post}
             userId={userId || undefined}
             currentUserAvatar={currentUser?.avatar}
             onUpdate={(postId, updatedPost) => {
               setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
               onUpdatePost?.(postId, updatedPost);
             }}
             onDelete={(postId) => {
               setPosts(prev => prev.filter(p => p.id !== postId));
               onDeletePost?.(postId);
             }}
             onCommentAdded={onCommentAdded}
             disableDialog={true}
           />
         ))
       )}

      {/* Loading more indicator */}
      {backendAvailable && !loading && loadingMore && (
        <div className="flex justify-center py-6 text-sm text-muted-foreground">Loading more...</div>
      )}

      {/* No more posts indicator */}
      {backendAvailable && !loading && !loadingMore && posts.length > 0 && !hasMore && (
        <div className="flex justify-center py-6 text-xs text-muted-foreground">You have reached the end.</div>
      )}

      {/* Backend unavailable message */}
      {!backendAvailable && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-destructive">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                <p className="text-sm">
                  Unable to connect to the server. Please check your connection and try again.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBackendAvailable(true);
                  setLoading(true);
                  load();
                }}
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

Feed.displayName = 'Feed';

export default Feed;
