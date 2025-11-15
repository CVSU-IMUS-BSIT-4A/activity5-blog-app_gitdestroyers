import { useState, useEffect, useRef } from 'react';
import { updateComment, deleteComment, toggleCommentLike, getCommentLikeCounts, getUserCommentLikeStatus, getCommentHistory } from '../api';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { MoreHorizontal, Edit, Trash2, Heart, ThumbsDown, History } from 'lucide-react';
import { toast } from 'sonner';
import { HistoryDialog } from './index';

interface CommentProps {
  comment: {
    id: number;
    text: string;
    created_at?: string;
    author?: {
      id: number;
      name?: string;
      email?: string;
      avatar?: string;
    } | null;
  };
  userId?: number;
  onUpdate: (commentId: number, updatedComment: any) => void;
  onDelete: (commentId: number) => void;
  className?: string;
  containerRef?: (el: HTMLDivElement | null) => void;
}

export default function Comment({ comment, userId, onUpdate, onDelete, className, containerRef }: CommentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = comment.author && userId === comment.author.id;

  // Load likes data when component mounts
  useEffect(() => {
    const loadLikesData = async () => {
      if (!userId) return;
      
      try {
        const [countsData, statusData] = await Promise.all([
          getCommentLikeCounts(comment.id),
          getUserCommentLikeStatus(comment.id, userId)
        ]);
        
        setLikes(countsData.likeCount);
        setDislikes(countsData.dislikeCount);
        setIsLiked(statusData.isLiked);
        setIsDisliked(statusData.isDisliked);
      } catch (error) {
        console.error('Failed to load comment likes data:', error);
      }
    };

    loadLikesData();
  }, [comment.id, userId]);

  // Check if comment has edit history
  useEffect(() => {
    const checkHistory = async () => {
      try {
        const history = await getCommentHistory(comment.id);
        setHasHistory(history.length > 0);
      } catch (error) {
        console.error('Failed to check comment history:', error);
        setHasHistory(false);
      }
    };

    checkHistory();
  }, [comment.id]);

  // Re-check history when comment content changes (for updates from other users)
  useEffect(() => {
    const checkHistory = async () => {
      try {
        const history = await getCommentHistory(comment.id);
        setHasHistory(history.length > 0);
      } catch (error) {
        console.error('Failed to check comment history:', error);
        setHasHistory(false);
      }
    };

    checkHistory();
  }, [comment.text]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleSave = async () => {
    try {
      const updated = await updateComment(comment.id, { text: editText });
      onUpdate(comment.id, updated);
      setIsEditing(false);
      // History will be created by the backend, so show the button immediately
      setHasHistory(true);
      toast.success('Comment updated successfully!');
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(comment.id);
      onDelete(comment.id);
      toast.success('Comment deleted');
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      const message = error?.response?.data?.message || 'Failed to delete comment';
      toast.error(typeof message === 'string' ? message : 'Failed to delete comment');
      throw error;
    }
  };

  const handleLike = async () => {
    if (!userId || likesLoading) return;
    
    setLikesLoading(true);
    try {
      const result = await toggleCommentLike(comment.id, userId, true);
      setLikes(result.likeCount);
      setDislikes(result.dislikeCount);
      
      if (isLiked) {
        setIsLiked(false);
      } else {
        setIsLiked(true);
        setIsDisliked(false);
      }
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
    } finally {
      setLikesLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!userId || likesLoading) return;
    
    setLikesLoading(true);
    try {
      const result = await toggleCommentLike(comment.id, userId, false);
      setLikes(result.likeCount);
      setDislikes(result.dislikeCount);
      
      if (isDisliked) {
        setIsDisliked(false);
      } else {
        setIsDisliked(true);
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Failed to toggle comment dislike:', error);
    } finally {
      setLikesLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const commentDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - commentDate.getTime();
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
      return commentDate.toLocaleDateString();
    }
  };

  return (
    <div ref={containerRef} className={`flex items-start gap-3 p-3 bg-muted/30 rounded-lg ${className || ''}`}>
      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 overflow-hidden">
        {comment.author?.avatar ? (
          <img 
            src={`http://localhost:3005${comment.author.avatar}`} 
            alt="Avatar" 
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 
          comment.author?.email ? comment.author.email.charAt(0).toUpperCase() : 'U'
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            {comment.author?.name || comment.author?.email || 'Unknown'}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          {comment.created_at ? formatTimeAgo(comment.created_at) : ''}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="min-h-16"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditText(comment.text);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm break-words">{comment.text}</p>
            
            {/* Like/Dislike Buttons */}
            <div className="flex items-center gap-4 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-xs ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                onClick={handleLike}
                disabled={likesLoading}
              >
                <Heart className={`h-3 w-3 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {likes}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-xs ${isDisliked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                onClick={handleDislike}
                disabled={likesLoading}
              >
                <ThumbsDown className={`h-3 w-3 mr-1 ${isDisliked ? 'fill-current' : ''}`} />
                {dislikes}
              </Button>
            </div>
          </>
        )}
      </div>
      {!isEditing && (
        <div className="flex items-center gap-1">
          {/* History button - only show if comment has been edited */}
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

          {/* Owner menu - only for comment owner */}
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
                <div className="absolute right-0 top-8 z-50 w-40 bg-background border border-border rounded-lg shadow-lg">
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
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Delete Comment Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete comment?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this comment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button
              className="text-destructive"
              onClick={async () => {
                try {
                  await handleDelete();
                  setShowDeleteDialog(false);
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
        type="comment"
        itemId={comment.id}
      />
    </div>
  );
}


