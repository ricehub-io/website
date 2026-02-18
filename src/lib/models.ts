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
}

export interface Dotfiles {
    filePath: string;
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

export interface LoginResponse {
    accessToken: string;
    user: User;
}

// internal types
export type NotificationSeverity = "info" | "warning" | "error";

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    severity: NotificationSeverity;
}
