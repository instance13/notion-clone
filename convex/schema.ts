import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    /* 
    v = The validator builder. 
    This builder allows you to build validators for Convex values.
    */
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    // every document can have a parent document, a relation with another.
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    // is it a shared document?
    isPublished: v.boolean(),
  })
  // params: 1). name, 2). an ordered list of fields to index
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"])
});