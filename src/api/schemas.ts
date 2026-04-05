// This file contains zod schemas used for runtime validation of everything related to API

import * as z from "zod";

// DTOs
// -- USERS
export const UserSchema = z.object({
    id: z.uuidv4(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.url(),
    isAdmin: z.boolean(),
    isBanned: z.boolean(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const UserBanSchema = z.object({
    id: z.uuidv4(),
    userId: z.uuidv4(),
    adminId: z.uuidv4(),
    reason: z.string(),
    isRevoked: z.boolean(),
    revokedAt: z.coerce.date().optional(),
    bannedAt: z.coerce.date(),
    expiresAt: z.coerce.date().optional(),
});

// -- TAGS
export const TagSchema = z.object({
    id: z.int(),
    name: z.string(),
});
export type Tag = z.infer<typeof TagSchema>;

// -- RICES
export const RiceStateSchema = z.enum(["waiting", "accepted"]);
// export type RiceState = z.infer<typeof RiceStateSchema>;

export const DotfilesTypeSchema = z.enum(["free", "one-time"]);

export const RiceDotfilesSchema = z.object({
    filePath: z.string(),
    fileSize: z.number(),
    type: DotfilesTypeSchema,
    price: z.float32().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export type RiceDotfiles = z.infer<typeof RiceDotfilesSchema>;

export const RiceScreenshotSchema = z.object({
    id: z.uuidv4(),
    url: z.url(),
});
export type RiceScreenshot = z.infer<typeof RiceScreenshotSchema>;

export const RiceSchema = z.object({
    id: z.uuidv4(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),

    downloads: z.number(),
    stars: z.number(),
    isStarred: z.boolean(),
    isOwned: z.boolean(),

    screenshots: RiceScreenshotSchema.array(),
    dotfiles: RiceDotfilesSchema,
    tags: TagSchema.array(),

    author: UserSchema,
});
export type Rice = z.infer<typeof RiceSchema>;

// this schema is a minimal version of RiceSchema
// e.g. home page, user's profile, account page
export const PartialRiceSchema = z.object({
    id: z.uuidv4(),
    title: z.string(),
    slug: z.string(),
    displayName: z.string(),
    username: z.string(),
    thumbnail: z.string(),
    stars: z.number(),
    comments: z.number(),
    downloads: z.number(),
    isStarred: z.boolean(),
    isFree: z.boolean(),
    state: RiceStateSchema,
    // not coercing to date because then it loses precision which is needed for pagination
    createdAt: z.string(),
    score: z.float32(),
    tags: z.string().array(),
});
export type PartialRice = z.infer<typeof PartialRiceSchema>;

// -- COMMENTS
export const CommentSchema = z.object({
    id: z.uuidv4(),
    content: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

// -- PROFILES
export const ProfileSchema = z.object({
    user: UserSchema,
    rices: PartialRiceSchema.array(),
});
export type Profile = z.infer<typeof ProfileSchema>;

// -- WEBSITE VARIABLES
export const WebsiteVariableSchema = z.object({
    value: z.string(),
    updatedAt: z.coerce.date(),
});
export type WebsiteVariable = z.infer<typeof WebsiteVariableSchema>;

// -- LINKS
export const ExternalLinkSchema = z.object({
    url: z.url(),
});

// -- SERVICE STATISTICS
export const ServiceStatisticsSchema = z.object({
    userCount: z.number(),
    user24hCount: z.number(),
    riceCount: z.number(),
    rice24hCount: z.number(),
    commentCount: z.number(),
    comment24hCount: z.number(),
    reportCount: z.number(),
    openReportCount: z.number(),
});
export type ServiceStatistics = z.infer<typeof ServiceStatisticsSchema>;

// -- LEADERBOARD
export const LeaderboardRiceSchema = z.object({
    position: z.number(),
    id: z.uuidv4(),
    title: z.string(),
    slug: z.string(),
    displayName: z.string(),
    username: z.string(),
    thumbnail: z.string(),
    stars: z.number(),
    comments: z.number(),
    downloads: z.number(),
    isStarred: z.boolean(),
    isFree: z.boolean(),
    state: RiceStateSchema,
    createdAt: z.coerce.date(),
    score: z.float32(),
    tags: z.string().array(),
});
export type LeaderboardRice = z.infer<typeof LeaderboardRiceSchema>;

// DTOs with relations/merged fields
export const UserWithBanSchema = z.object({
    user: UserSchema,
    ban: UserBanSchema,
});
export type UserWithBan = z.infer<typeof UserWithBanSchema>;

export const CommentWithUserSchema = z.object({
    commentId: z.uuidv4(),
    content: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),

    displayName: z.string(),
    username: z.string(),
    avatar: z.string(),
    isBanned: z.boolean(),
});
export type CommentWithUser = z.infer<typeof CommentWithUserSchema>;

export const ReportWithUserSchema = z.object({
    id: z.uuidv4(),
    reason: z.string(),
    riceId: z.uuidv4().optional(),
    commentId: z.uuidv4().optional(),
    isClosed: z.boolean(),
    createdAt: z.coerce.date(),

    reporterId: z.uuidv4(),
    username: z.string(),
    displayName: z.string(),
});
export type ReportWithUser = z.infer<typeof ReportWithUserSchema>;

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

export const CommentWithRiceSlugSchema = z.object({
    id: z.uuidv4(),
    authorId: z.uuidv4(),
    content: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),

    riceId: z.uuidv4(),
    riceSlug: z.string(),
    riceAuthorUsername: z.string(),
});

// API Requests
interface BaseReport {
    reason: string;
}

interface ReportRice extends BaseReport {
    riceId: string;
}

interface ReportComment extends BaseReport {
    commentId: string;
}

export type CreateReport = ReportRice | ReportComment;

// API Responses
export const LoginSchema = z.object({
    accessToken: z.jwt(),
    user: UserSchema,
});

export const FetchRicesSchema = z.object({
    pageCount: z.number(),
    rices: PartialRiceSchema.array(),
});

export const ReportCreatedSchema = z.object({
    reportId: z.uuidv4(),
});

export const NewAvatarSchema = z.object({
    avatarUrl: z.url(),
});

export const PurchaseRiceSchema = z.object({
    checkoutUrl: z.url(),
});
