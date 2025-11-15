import axios from 'axios';

export const api = axios.create({ baseURL: 'http://localhost:3005' });

export type LoginResponse = { accessToken: string };
export type UserRef = { id: number; name?: string; email?: string; bio?: string; avatar?: string; created_at?: string };
export type Comment = { id: number; text: string; author?: UserRef | null };
export type Post = { id: number; title: string; content: string; author?: UserRef | null; comments?: Comment[]; created_at?: string };
export type PostHistory = { id: number; postId: number; editorId: number; previousTitle: string; previousContent: string; newTitle: string; newContent: string; editedAt: string; editor?: UserRef };
export type CommentHistory = { id: number; commentId: number; editorId: number; previousContent: string; newContent: string; editedAt: string; editor?: UserRef };

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('a5_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('a5_token');
  }
}

export function loadTokenFromStorage() {
  const t = localStorage.getItem('a5_token');
  if (t) setAuthToken(t);
}

export function getCurrentUserIdFromToken(): number | null {
  const t = localStorage.getItem('a5_token');
  if (!t) return null;
  try {
    const [, payloadB64] = t.split('.');
    const json = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    const sub = Number(json?.sub);
    return Number.isFinite(sub) ? sub : null;
  } catch {
    return null;
  }
}

export async function register(email: string, name: string, password: string) {
  return api.post('/auth/register', { email, name, password });
}

export async function login(email: string, password: string) {
  const res = await api.post<LoginResponse>('/auth/login', { email, password });
  return res.data;
}

export async function listPosts(page = 1, pageSize = 10) {
  const res = await api.get(`/posts`, { params: { page, pageSize } });
  const payload = res.data;
  if (Array.isArray(payload)) {
    return { data: payload as Post[], total: payload.length, page, pageSize };
  }
  if (payload && Array.isArray(payload.data)) {
    return payload as { data: Post[]; total: number; page: number; pageSize: number };
  }
  return { data: [], total: 0, page, pageSize };
}

export async function getPost(id: number) {
  const res = await api.get<Post>(`/posts/${id}`);
  return res.data;
}

export async function createPost(title: string, content: string) {
  const res = await api.post<Post>('/posts', { title, content });
  return res.data;
}

export async function addComment(postId: number, text: string) {
  const res = await api.post<Comment>('/comments', { postId, text });
  return res.data;
}

export async function updatePost(id: number, data: Partial<Pick<Post, 'title' | 'content'>>) {
  const res = await api.patch<Post>(`/posts/${id}`, data);
  return res.data;
}

export async function deletePost(id: number) {
  const res = await api.delete<{ deleted: boolean }>(`/posts/${id}`);
  return res.data;
}

export async function updateComment(id: number, data: Partial<{ text: string }>) {
  const res = await api.patch<Comment>(`/comments/${id}`, data);
  return res.data;
}

export async function deleteComment(id: number) {
  const res = await api.delete<{ deleted: boolean }>(`/comments/${id}`);
  return res.data;
}

export async function getUser(id: number) {
  const res = await api.get<UserRef>(`/users/${id}`);
  return res.data;
}

export async function updateUser(id: number, data: Partial<{ name: string; email: string; password: string; bio: string; currentPassword: string }>) {
  const res = await api.patch<UserRef>(`/users/${id}`, data);
  return res.data;
}

export async function uploadAvatar(id: number, file: File): Promise<UserRef> {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const res = await api.post<UserRef>(`/users/${id}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function deleteUser(id: number) {
  const res = await api.delete<{ deleted: boolean }>(`/users/${id}`);
  return res.data;
}
export async function toggleLike(postId: number, userId: number, isLike: boolean) {
  const res = await api.post<{ likeCount: number; dislikeCount: number }>('/likes/toggle', {
    postId,
    userId,
    isLike,
  });
  return res.data;
}

export async function getPostLikeCounts(postId: number) {
  const res = await api.get<{ likeCount: number; dislikeCount: number }>(`/likes/post/${postId}`);
  return res.data;
}

export async function getUserLikeStatus(postId: number, userId: number) {
  const res = await api.get<{ isLiked: boolean; isDisliked: boolean }>(`/likes/post/${postId}/user/${userId}`);
  return res.data;
}

// Comment Likes API
export async function toggleCommentLike(commentId: number, userId: number, isLike: boolean) {
  const res = await api.post<{ likeCount: number; dislikeCount: number }>('/likes/comment/toggle', {
    commentId,
    userId,
    isLike,
  });
  return res.data;
}

export async function getCommentLikeCounts(commentId: number) {
  const res = await api.get<{ likeCount: number; dislikeCount: number }>(`/likes/comment/${commentId}`);
  return res.data;
}

export async function getUserCommentLikeStatus(commentId: number, userId: number) {
  const res = await api.get<{ isLiked: boolean; isDisliked: boolean }>(`/likes/comment/${commentId}/user/${userId}`);
  return res.data;
}

// Notifications API
export async function getNotifications(userId: number) {
  const res = await api.get<any[]>(`/notifications`);
  return res.data;
}

export async function getUnreadNotificationCount(userId: number) {
  const res = await api.get<{ count: number }>(`/notifications/unread-count`);
  return res.data;
}

export async function markAllNotificationsAsRead(userId: number) {
  const res = await api.post<{ message: string }>(`/notifications/mark-all-read`);
  return res.data;
}

export async function markNotificationAsRead(notificationId: number, userId: number) {
  const res = await api.post<any>(`/notifications/${notificationId}/read`);
  return res.data;
}

export async function markNotificationAsUnread(notificationId: number, userId: number) {
  const res = await api.post<any>(`/notifications/${notificationId}/unread`);
  return res.data;
}

export async function deleteNotification(notificationId: number, userId: number) {
  const res = await api.post<{ message: string }>(`/notifications/${notificationId}/delete`);
  return res.data;
}

// History API
export async function getPostHistory(postId: number) {
  const res = await api.get<PostHistory[]>(`/posts/${postId}/history`);
  return res.data;
}

export async function getCommentHistory(commentId: number) {
  const res = await api.get<CommentHistory[]>(`/comments/${commentId}/history`);
  return res.data;
}

