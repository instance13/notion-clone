import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { isPromise } from "util/types";
import { DEFAULT_MAX_VERSION } from "tls";


export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const userId = identity.subject; // user id

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found.");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized.");
    }

    const recursiveArchive = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) => (
          q
            .eq("userId", userId)
            .eq("parentDocument", documentId)
        ))
        .collect();

      for (const child of children) { // archive children recursively
        await ctx.db.patch(child._id, {
          isArchived: true,
        });
        await recursiveArchive(child._id);
      }
    };

    const document = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    recursiveArchive(args.id);
    return document;
  }
});

// // construction of a get operation in convex [!]
// // query: function to define data base operations.
// export const get = query({
//   // does not receive args because it is a get operation, only ctx
//   /*
//   why it does receive a context as an argument?
//   -> because ctx stores information aboout the quety, such as authentication, anda database
//   */
//   // handler is a property of a query.
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();

//     if (!identity) {
//       throw new Error("Not authenticated.");
//     }

//     // query to documents table (see schema.ts) and then collect all the documents stored in it.
//     const documents = await ctx.db.query("documents").collect();
//     // return the collected documents
//     return documents;
//   }
// });

// objective: get documents from database (convex)
export const getSidebar = query({
  args: {
    parentDocument: v.optional(v.id("documents"))
  },
  // function that will be executed when getSidebar is called.
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const userId = identity.subject; // user id

    const documents = await ctx.db // get documents by user id and parent document id (if existent). only get not archived docs. docs are sort in a descendent way and given in an array.
      .query("documents")
      .withIndex("by_user_parent", (q) => q
        .eq("userId", userId)
        .eq("parentDocument", args.parentDocument)
      )
      .filter((q) =>
        q.eq(q.field("isArchived"), false)
      )
      .order("desc")
      .collect();

    return documents;
  }
});

/* 
def: a mutation in convex is a operation which inserts, updates or deletes data
in a database, checks authentication, and maybe returns a response to the client.
params for mutation constructor: an object with a managment func (handler in this
case).

this mutation accepts a title and a parentDocument as arguments.
*/
export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents"))
  },
  // fetch the current logged user 
  // ctx for context
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated.");
    }

    /*
    Identifier for the end-user from the identity provider, not necessarily
    unique across different providers.
    */
    const userId = identity.subject;

    const document = await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parentDocument,
      userId,
      isArchived: false,
      isPublished: false,
    });
    return document;
  }
});

export const getTrash = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated.");
    }
    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.
          eq(q.field("isArchived"), true),
      )
      .order("desc")
      .collect();

    return documents;
  }
});

export const restore = mutation({
  args: { id: v.id("documents") }, // a document
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id); // a document has an id property

    if (!existingDocument) {
      throw new Error("Not found.");
    };

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized.");
    };

    const recursiveRestore = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) => (
          q
            .eq("userId", userId)
            .eq("parentDocument", documentId)
        ))
        .collect();

      for (const child of children) { // archive children recursively
        await ctx.db.patch(child._id, {
          isArchived: false,
        });
        await recursiveRestore(child._id);
      }
    };

    const options: Partial<Doc<"documents">> = {
      isArchived: false, // only necessary isArchived property
    };

    if (existingDocument.parentDocument) {
      const parent = await ctx.db.get(existingDocument.parentDocument);

      if (parent?.isArchived) {
        options.parentDocument = undefined;
      };
    };

    const document = await ctx.db.patch(args.id, options);

    recursiveRestore(args.id);

    return document;
  }
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id); // a document has an id property

    if (!existingDocument) {
      throw new Error("Not found.");
    };

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized.");
    };

    const document = await ctx.db.delete(args.id);

    return document;
  }
});

export const getSearch = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.eq(q.field("isArchived"), false),
      )
      .order("desc")
      .collect();

    return documents;
  }
});

export const getById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    // get identity
    const identity = await ctx.auth.getUserIdentity();

    const document = await ctx.db.get(args.documentId);

    // check identity
    if (!document) { 
      throw new Error("Not found");
    };

    // the doc is public and is not archived
    if (document.isPublished && !document.isArchived) {
      return document;
    };

    if (!identity) {
      throw new Error("Not authenticated.");
    };

    // get identity id
    const userId = identity.subject;

    // are you allowed?
    if (document.userId !== userId) {
      throw new Error("Unauthorized");
    };

    return document;
  }
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated.");
    };

    const userId = identity.subject;

    const { id, ...rest } = args;
    
    const existingDocument = await ctx.db.get(args.id); // a document has an id property

    if (!existingDocument) {
      throw new Error("Not found.");
    };

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized.");
    };

    const document = await ctx.db.patch(args.id, {
      ...rest,
    });
    return document;
  }
});

export const removeIcon = mutation({
  args: {
    id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if(!identity) {
      throw new Error("Not authenticated.");
    };

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    };

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized.");
    };

    const document = await ctx.db.patch(args.id, {
      icon: undefined,
    });

    return document;
  }
});

export const removeCoverImage = mutation({
  args: {
    id: v.id("documents")
  },
  handler: async (ctx, args) => { 
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated.");
    };

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    };

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized.");
    };

    const document = await ctx.db.patch(args.id, {
      coverImage: undefined,
    });

    return document;
  }
});