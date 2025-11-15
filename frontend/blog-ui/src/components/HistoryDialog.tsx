import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { Clock, User, FileText, MessageSquare } from 'lucide-react'
import { getPostHistory, getCommentHistory, PostHistory, CommentHistory } from '../api'
import { formatDistanceToNow } from 'date-fns'

type HistoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'post' | 'comment'
  itemId: number
}

export default function HistoryDialog({ open, onOpenChange, type, itemId }: HistoryDialogProps) {
  const [history, setHistory] = useState<(PostHistory | CommentHistory)[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !itemId) return

    const fetchHistory = async () => {
      setLoading(true)
      try {
        const data = type === 'post' 
          ? await getPostHistory(itemId)
          : await getCommentHistory(itemId)
        setHistory(data)
      } catch (error) {
        console.error('Failed to fetch history:', error)
        setHistory([])
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [open, itemId, type])

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Unknown time'
    }
  }

  const renderPostHistory = (item: PostHistory) => (
    <div key={item.id} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{item.editor?.name || 'Unknown User'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatDate(item.editedAt)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {item.previousTitle !== item.newTitle && (
          <div>
            <Badge variant="outline" className="mb-2">Title Changes</Badge>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Previous:</p>
                <p className="text-sm bg-red-50 dark:bg-red-950/20 p-2 rounded border-l-2 border-red-200 dark:border-red-800">
                  {item.previousTitle}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New:</p>
                <p className="text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded border-l-2 border-green-200 dark:border-green-800">
                  {item.newTitle}
                </p>
              </div>
            </div>
          </div>
        )}

        {item.previousContent !== item.newContent && (
          <div>
            <Badge variant="outline" className="mb-2">Content Changes</Badge>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Previous:</p>
                <div className="text-sm bg-red-50 dark:bg-red-950/20 p-2 rounded border-l-2 border-red-200 dark:border-red-800 max-h-32 overflow-y-auto">
                  {item.previousContent}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New:</p>
                <div className="text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded border-l-2 border-green-200 dark:border-green-800 max-h-32 overflow-y-auto">
                  {item.newContent}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderCommentHistory = (item: CommentHistory) => (
    <div key={item.id} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{item.editor?.name || 'Unknown User'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatDate(item.editedAt)}</span>
        </div>
      </div>

      <div>
        <Badge variant="outline" className="mb-2">Content Changes</Badge>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Previous:</p>
            <div className="text-sm bg-red-50 dark:bg-red-950/20 p-2 rounded border-l-2 border-red-200 dark:border-red-800 max-h-32 overflow-y-auto">
              {item.previousContent}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">New:</p>
            <div className="text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded border-l-2 border-green-200 dark:border-green-800 max-h-32 overflow-y-auto">
              {item.newContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'post' ? <FileText className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
            {type === 'post' ? 'Post' : 'Comment'} Edit History
          </DialogTitle>
          <DialogDescription>
            View the edit history for this {type}. Changes are shown with previous content in red and new content in green.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading history...</div>
              </div>
            ) : history.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No edit history found.</div>
              </div>
            ) : (
              history.map((item) => 
                type === 'post' 
                  ? renderPostHistory(item as PostHistory)
                  : renderCommentHistory(item as CommentHistory)
              )
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
