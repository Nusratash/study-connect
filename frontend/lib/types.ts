// Shapes returned by the REST API. Kept in one place so pages stay type-safe.

export type Role = 'student' | 'expert' | 'admin';
export type MentorshipStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export type PostStatus = 'open' | 'resolved';

export interface StudentProfile {
  interests: string[];
  educationLevel?: string | null;
  goals?: string | null;
}

export interface ExpertProfile {
  expertise: string[];
  credentials?: string | null;
  availability?: string | null;
  ratingAvg: number;
  isApproved: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: Role;
  bio?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
  createdAt?: string;
  studentProfile?: StudentProfile | null;
  expertProfile?: ExpertProfile | null;
}

export interface Material {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  tags: string[];
  fileUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
  visibility: 'public' | 'students' | 'private';
  uploaderId: string;
  uploader?: User;
  createdAt: string;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  status: PostStatus;
  upvotes: number;
  commentCount?: number;
  acceptedCommentId?: string | null;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author?: User;
  createdAt: string;
}

export interface MentorshipRequest {
  id: string;
  message: string;
  status: MentorshipStatus;
  createdAt: string;
  updatedAt: string;
  student?: User;
  expert?: User;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: User;
  conversationId: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  otherUser: User;
  lastMessage: Message | null;
  unreadCount: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  content: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalStudents: number;
  totalExperts: number;
  pendingExperts: number;
  totalPosts: number;
  resolvedPosts: number;
  totalMaterials: number;
  totalMentorships: number;
}

export interface AdminUser extends User {
  isVerified: boolean;
  createdAt: string;
}
