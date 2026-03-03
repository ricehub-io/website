// This file contains zod schemas used for runtime validation of everything related to API

import * as z from "zod";

// DTOs
export const RiceStateSchema = z.enum(["waiting", "accepted"]);
// export type RiceState = z.infer<typeof RiceStateSchema>;

export const PartialRiceSchema = z.object({
    id: z.uuidv4(),
    title: z.string(),
    slug: z.string(),
    displayName: z.string(),
    username: z.string(),
    thumbnail: z.string(),
    stars: z.number(),
    downloads: z.number(),
    isStarred: z.boolean(),
    state: RiceStateSchema,
    // not coercing to date because then it loses precision which is needed for pagination
    createdAt: z.string(),
    score: z.float32(),
});
export type PartialRice = z.infer<typeof PartialRiceSchema>;

// Responses
export const FetchRicesSchema = z.object({
    pageCount: z.number(),
    rices: z.array(PartialRiceSchema),
});
