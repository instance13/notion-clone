"use client";

import { useConvexAuth } from "convex/react";
import { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { redirect } from "next/navigation";
import { Navigation } from "./_components/navigation";
import { SearchCommand } from "@/components/search-command";

const MainLayout = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) { 
    return (
      <div className="h-full flex justify-center items-center">
        <Spinner size="lg"/>
      </div>
    );
  }

  if (!isAuthenticated) { // every route inside of (main) is protected
    return redirect('/');
  };

  return (
    <div className="h-full flex dark:bg-[#1F1F1F]">
      <Navigation />
      <main className="flex-1 h-full overflow-y-auto">
        <SearchCommand />
        {children}
      </main>
    </div>
  );
}

export default MainLayout;