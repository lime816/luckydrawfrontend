// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  twoFactorEnabled: boolean;
  permissions?: PagePermissions;
  customRole?: string;
}

export interface PagePermissions {
  dashboard?: PermissionLevel[];
  contests?: PermissionLevel[];
  participants?: PermissionLevel[];
  draw?: PermissionLevel[];
  winners?: PermissionLevel[];
  communication?: PermissionLevel[];
  analytics?: PermissionLevel[];
  settings?: PermissionLevel[];
  user_management?: PermissionLevel[];
  admin_management?: PermissionLevel[];
}

export type PermissionLevel = 'read' | 'write' | 'update';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Contest Types
export interface Contest {
  id: string;
  name: string;
  theme: string;
  description: string;
  startTime: string; // Lucky draw start time (required)
  endTime: string;   // Lucky draw end time (required)
  status: ContestStatus;
  prizes: Prize[];
  entryRules: string;
  participationMethod: ParticipationMethod[];
  totalParticipants: number;
  totalEntries: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  qrCodeUrl?: string; // URL for QR code participation
  isActive?: boolean; // Whether the contest is active/enabled
  approvalStatus?: ApprovalStatus; // Approval status for non-superadmin contests
  rejectionReason?: string; // Reason if rejected
}

export enum ContestStatus {
  DRAFT = 'DRAFT',
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ParticipationMethod {
  ONLINE = 'ONLINE',
  QR_CODE = 'QR_CODE',
  MANUAL = 'MANUAL',
}

export interface Prize {
  id: string;
  name: string;
  value: number;
  quantity: number;
  imageUrl?: string;
}

// Participant Types
export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  contestId: string;
  entryDate: string;
  entryMethod: ParticipationMethod;
  ipAddress?: string;
  deviceId?: string;
  isDuplicate: boolean;
  isValid: boolean;
  metadata?: Record<string, any>;
}

// Winner Types
export interface Winner {
  id: string;
  participantId: string;
  participant: Participant;
  contestId: string;
  contest: Contest;
  prize: Prize;
  wonAt: string;
  prizeStatus: PrizeStatus;
  notificationSent: boolean;
  claimedAt?: string;
  dispatchedAt?: string;
  notes?: string;
}

export enum PrizeStatus {
  PENDING = 'PENDING',
  NOTIFIED = 'NOTIFIED',
  CLAIMED = 'CLAIMED',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
}

// Draw Types
export interface Draw {
  id: string;
  contestId: string;
  executedBy: string;
  executedAt: string;
  drawType: DrawType;
  winnersCount: number;
  winners: Winner[];
  isLive: boolean;
}

export enum DrawType {
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
}

// Communication Types
export interface Message {
  id: string;
  type: MessageType;
  recipients: string[];
  subject?: string;
  content: string;
  sentAt: string;
  sentBy: string;
  status: MessageStatus;
}

export enum MessageType {
  WELCOME = 'WELCOME',
  REMINDER = 'REMINDER',
  RESULT = 'RESULT',
  CUSTOM = 'CUSTOM',
}

export enum MessageStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

// Analytics Types
export interface Analytics {
  totalContests: number;
  activeContests: number;
  totalParticipants: number;
  totalWinners: number;
  participationTrend: TrendData[];
  contestPerformance: ContestPerformance[];
}

export interface TrendData {
  date: string;
  count: number;
}

export interface ContestPerformance {
  contestId: string;
  contestName: string;
  participants: number;
  entries: number;
  engagementRate: number;
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  details?: Record<string, any>;
}

// Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}
