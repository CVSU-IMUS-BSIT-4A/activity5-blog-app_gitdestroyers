import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  updatePost,
  deletePost,
  addComment,
  toggleLike,
  getPostLikeCounts,
  getUserLikeStatus,
  getPostHistory,
} from '../api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Field, FieldContent, FieldLabel } from './ui/field';
import { MoreHorizontal, Edit, Trash2, Heart, MessageCircle, ThumbsDown, History } from 'lucide-react';
import Comment from './Comment';
import type { Post } from '../api';
import { ScrollArea } from './ui/scroll-area';
import { HistoryDialog } from './index';

interface PostCardProps {
  post: Post;
  userId?: number;
  currentUserAvatar?: string;
  onUpdate: (postId: number, updatedPost: Post) => void;
  onDelete: (postId: number) => void;
  onCommentAdded?: () => void;
  autoOpenComments?: boolean;
  disableDialog?: boolean;
  truncateContent?: boolean;

  onOpenDetails?: (opts?: { focusCommentId?: number }) => void;

  focusCommentId?: number;

  highlightCommentId?: number;
}

export default function PostCard({
  post,
  userId,
  currentUserAvatar,
  onUpdate,
  onDelete,
  onCommentAdded,
  autoOpenComments = false,
  disableDialog = true,
  onOpenDetails,
  focusCommentId,
  highlightCommentId, 
  truncateContent = true,
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeletePostDialog, setShowDeletePostDialog] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showInlineComments, setShowInlineComments] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);
  const [scrolledToComment, setScrolledToComment] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const commentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const allComments = post.comments || [];
  const commentCount = allComments.length;
  const isOwner = post.author && userId === post.author.id;


  const effectiveFocusId = focusCommentId ?? highlightCommentId ?? null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);


  useEffect(() => {
    if (!autoOpenComments) return;

    if (onOpenDetails) {
      onOpenDetails({ focusCommentId: effectiveFocusId ?? undefined });
    } else {
      setShowInlineComments(true);
    }
  }, [autoOpenComments, onOpenDetails, effectiveFocusId]);

  useEffect(() => {
    if (effectiveFocusId && showInlineComments && !scrolledToComment) {
      setTimeout(() => {
        const commentElement = commentRefs.current[effectiveFocusId];
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          commentElement.classList.add('animate-pulse');
          setTimeout(() => commentElement.classList.remove('animate-pulse'), 2000);
        }
        setScrolledToComment(true);
      }, 300);
    }
  }, [effectiveFocusId, showInlineComments, scrolledToComment]);

  useEffect(() => {
    setScrolledToComment(false);
  }, [effectiveFocusId]);

  useEffect(() => {
    const loadLikesData = async () => {
      if (!userId) return;
      try {
        const [countsData, statusData] = await Promise.all([
          getPostLikeCounts(post.id),
          getUserLikeStatus(post.id, userId),
        ]);

        setLikes(countsData.likeCount);
        setDislikes(countsData.dislikeCount);
        setIsLiked(statusData.isLiked);
        setIsDisliked(statusData.isDisliked);
      } catch (error) {
        console.error('Failed to load likes data:', error);
      }
    };

    loadLikesData();
  }, [post.id, userId]);

  // Check if post has edit history
  useEffect(() => {
    const checkHistory = async () => {
      try {
        const history = await getPostHistory(post.id);
        setHasHistory(history.length > 0);
      } catch (error) {
        console.error('Failed to check post history:', error);
        setHasHistory(false);
      }
    };

    checkHistory();
  }, [post.id]);

  // Re-check history when post content changes (for updates from other users)
  useEffect(() => {
    const checkHistory = async () => {
      try {
        const history = await getPostHistory(post.id);
        setHasHistory(history.length > 0);
      } catch (error) {
        console.error('Failed to check post history:', error);
        setHasHistory(false);
      }
    };

    checkHistory();
  }, [post.title, post.content]);

  const handleSavePost = async () => {
    try {
      const updated = await updatePost(post.id, { title: editTitle, content: editContent });
      onUpdate(post.id, updated);
      setIsEditing(false);
      setHasHistory(true);
      toast.success('Post updated successfully!');
    } catch (error) {
      console.error('Failed to update post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(post.id);
      onDelete(post.id);
      toast.success('Post deleted');
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      const message = error?.response?.data?.message || 'Failed to delete post';
      toast.error(typeof message === 'string' ? message : 'Failed to delete post');
      throw error;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 1) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes}m ago`;
      }
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return postDate.toLocaleDateString();
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const newComment = await addComment(post.id, commentText);
    const updatedPost = {
      ...post,
      comments: [...(post.comments || []), newComment],
    };
    onUpdate(post.id, updatedPost);
    setCommentText('');

    // Notify parent to refresh notifications
    onCommentAdded?.();
  };

  const handleUpdateComment = (commentId: number, updatedComment: any) => {
    const updatedPost = {
      ...post,
      comments: (post.comments || []).map((c) => (c.id === commentId ? updatedComment : c)),
    };
    onUpdate(post.id, updatedPost);
  };

  const handleDeleteCommentLocal = (commentId: number) => {
    const updatedPost = {
      ...post,
      comments: (post.comments || []).filter((c) => c.id !== commentId),
    };
    onUpdate(post.id, updatedPost);
  };

  const handleLike = async () => {
    if (!userId || likesLoading) return;

    setLikesLoading(true);
    try {
      const result = await toggleLike(post.id, userId, true);
      setLikes(result.likeCount);
      setDislikes(result.dislikeCount);

      if (isLiked) {
        setIsLiked(false);
      } else {
        setIsLiked(true);
        setIsDisliked(false);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLikesLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!userId || likesLoading) return;

    setLikesLoading(true);
    try {
      const result = await toggleLike(post.id, userId, false);
      setLikes(result.likeCount);
      setDislikes(result.dislikeCount);

      if (isDisliked) {
        setIsDisliked(false);
      } else {
        setIsDisliked(true);
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Failed to toggle dislike:', error);
    } finally {
      setLikesLoading(false);
    }
  };

  const openComments = () => {
    if (onOpenDetails) {
      onOpenDetails({ focusCommentId: effectiveFocusId ?? undefined });
    } else {
      setShowInlineComments((v) => !v);
    }
  };

  return (
    <Card>
      <CardHeader>
        {isEditing ? (
          <div className="space-y-4">
            <Field>
              <FieldLabel>Title</FieldLabel>
              <FieldContent>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Content</FieldLabel>
              <FieldContent>
                <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
              </FieldContent>
            </Field>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSavePost}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(post.title);
                  setEditContent(post.content);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                  {post.author?.avatar ? (
                    <img
                      src={`http://localhost:3005${post.author.avatar}`}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : post.author?.name ? (
                    post.author.name.charAt(0).toUpperCase()
                  ) : post.author?.email ? (
                    post.author.email.charAt(0).toUpperCase()
                  ) : (
                    'U'
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-md font-medium text-foreground truncate">
                    {post.author?.name || post.author?.email || 'Unknown'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {post.created_at ? formatTimeAgo(post.created_at) : ''}
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl mt-3 break-all">{post.title}</CardTitle>
            </div>

            <div className="flex items-center gap-2">
              {/* History button - only show if post has been edited */}
              {hasHistory && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowHistoryDialog(true)}
                  title="View edit history"
                >
                  <History className="h-4 w-4" />
                </Button>
              )}

              {/* Owner menu - only for post owner */}
              {isOwner && (
                <div className="relative" ref={menuRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  {showMenu && (
                    <div className="absolute right-0 top-8 z-50 w-48 bg-background border border-border rounded-lg shadow-lg">
                      <div className="p-1 space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2"
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          Edit Post
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                          onClick={() => {
                            setShowMenu(false);
                            setShowDeletePostDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Post
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      {!isEditing && (
        <CardContent>
          {truncateContent ? (
            (() => {
              const MAX_CHARS = 300;
              const content = post.content || '';
              const isLong = content.length > MAX_CHARS;
              const preview = isLong ? content.slice(0, MAX_CHARS).trimEnd() + '…' : content;
              return (
                <div className="space-y-2">
                  <p className="whitespace-pre-wrap break-all text-foreground leading-relaxed">{preview}</p>
                  {isLong && (
                    <div>
                      <Link
                        to={`/post/${post.id}`}
                        className="text-primary hover:underline text-sm"
                      >
                        See more
                      </Link>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <p className="whitespace-pre-wrap break-all text-foreground leading-relaxed">{post.content}</p>
          )}
        </CardContent>
      )}

      {/* Stats Section */}
      <CardContent className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${
                isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`}
              onClick={handleLike}
              disabled={likesLoading}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {likes}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-blue-500"
              onClick={openComments}
            >
              <MessageCircle className="h-4 w-4" />
              {commentCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${
                isDisliked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`}
              onClick={handleDislike}
              disabled={likesLoading}
            >
              <ThumbsDown className={`h-4 w-4 ${isDisliked ? 'fill-current' : ''}`} />
              {dislikes}
            </Button>
          </div>
        </div>

        {/* Inline Comments */}
        {showInlineComments && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Comments ({commentCount})</h3>

            {/* Comments List */}
            <ScrollArea className="h-[420px] px-2 mt-3">
              <div className="space-y-6 mb-6 py-2">
                {allComments.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    userId={userId}
                  className={`p-3 rounded-md border bg-muted/20 border-border transition-all duration-300 ease-in-out ${
                      effectiveFocusId === comment.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    containerRef={(el) => (commentRefs.current[comment.id] = el)}
                    onUpdate={(commentId, updatedComment) => {
                      const updatedComments = allComments.map((c) =>
                        c.id === commentId ? updatedComment : c
                      );
                      onUpdate(post.id, { ...post, comments: updatedComments });
                    }}
                    onDelete={(commentId) => {
                      const updatedComments = allComments.filter((c) => c.id !== commentId);
                      onUpdate(post.id, { ...post, comments: updatedComments });
                    }}
                  />
                ))}
              </div>
            </ScrollArea>

            {/* Add Comment Form */}
            {userId && (
              <div className="border-t pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden flex-shrink-0">
                    {currentUserAvatar ? (
                      <img
                        src={`http://localhost:3005${currentUserAvatar}`}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : userId ? (
                      String.fromCharCode(65 + (userId % 26))
                    ) : (
                      'U'
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleAddComment} disabled={!commentText.trim()} size="sm">
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Delete Post Confirmation Dialog */}
      <Dialog open={showDeletePostDialog} onOpenChange={setShowDeletePostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this post and its comments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeletePostDialog(false)}>Cancel</Button>
            <Button
              className="text-destructive"
              onClick={async () => {
                try {
                  await handleDeletePost();
                  setShowDeletePostDialog(false);
                } catch {}
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <HistoryDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
        type="post"
        itemId={post.id}
      />
    </Card>
  );
}
