"use client";

import { ReactNode } from "react"; // repreents a set of nodes in a three in react
import { ConvexReactClient } from "convex/react"; // creates the convex library to create a client that interacts with the convex api
import { ConvexProviderWithClerk } from "convex/react-clerk"; // convex component that integrates itself with clerk in order to manage auth matters
import { ClerkProvider, useAuth } from "@clerk/clerk-react"; // clerk library funcs to manage auth stuff and get authenticated user information

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// nested components inside of the client provider
export const ConvexClientProvider = ({children}: { children: ReactNode;}) => { 
  return (
    // iniitialize clerk and and allow users auth
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ConvexProviderWithClerk
        useAuth={useAuth} // access to authenticated user info through a clerk hook
        client={convex} // instance of ConvexReactClient

        // render children in order to nested components to have access to convex and clerk functionalities ↓
      >
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};

/* 
what is the objective of this file?
- access convex and clerk features.

how?
- through a context design pattern.
*/