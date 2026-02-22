import { RefObject } from "preact";

// DTOs
export interface PartialRice {
    id: string;
    title: string;
    slug: string;
    displayName: string;
    username: string;
    thumbnail: string;
    stars: number;
    downloads: number;
    isStarred: boolean;
    createdAt: Date;
}

export interface Dotfiles {
    filePath: string;
    fileSize: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface RicePreview {
    id: string;
    url: string;
}

export interface Rice {
    id: string;
    title: string;
    slug: string;
    description: string;
    downloads: number;
    stars: number;
    isStarred: boolean;
    previews: RicePreview[];
    dotfiles: Dotfiles;
    author: User;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface RawComment {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CommentWithUser {
    // comment specific
    commentId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;

    // user specific
    displayName: string;
    username: string;
    avatar: string;
}

export interface RiceCommentWithSlug {
    id: string;
    riceId: string;
    authorId: string;
    content: string;
    riceSlug: string;
    riceAuthorUsername: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReportWithUser {
    // report related
    id: string;
    reason: string;
    riceId?: string;
    commentId?: string;
    isClosed: boolean;
    createdAt: Date;

    // user related
    reporterId: string;
    username: string;
    displayName: string;
}

export interface ServiceStatistics {
    userCount: number;
    user24hCount: number;
    riceCount: number;
    rice24hCount: number;
    commentCount: number;
    comment24hCount: number;
    reportCount: number;
    openReportCount: number;
}

export interface WebsiteVariable {
    value: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Link {
    url: string;
}

// RESPONSES
export interface CreateReportRes {
    reportId: string;
}

export interface LoginRes {
    accessToken: string;
    user: User;
}

// REQUESTS
/*
or:
type CreateReportReq =
  | { reason: string; riceId: string }
  | { reason: string; commentId: string }
*/
export interface CreateReportReq {
    reason: string;
    riceId?: string;
    commentId?: string;
}

// internal types
export type NotificationSeverity = "info" | "warning" | "error";

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    severity: NotificationSeverity;
    htmlRef: RefObject<HTMLDivElement>;
}

export interface IconProps {
    className?: string;
}
