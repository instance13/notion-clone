"use client";

// hooks ─── ⋆⋅☆⋅⋆ ───
import { useUser } from "@clerk/clerk-react"; // info about the authenticated user
import { useMutation } from "convex/react";
import {useRouter} from "next/navigation";

// gui ─── ⋆⋅☆⋅⋆ ───
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

// backend ─── ⋆⋅☆⋅⋆ ───
import { api } from "@/convex/_generated/api";

const DocumentsPage = () => {
  const { user } = useUser();
  // using the already created mutation in documents file
  const create = useMutation(api.documents.create);
  const router = useRouter();

  const onCreate = () => { 
    const promise = create({ title: "Untitled" })
      .then((documentId) => router.push(`/documents/${documentId}`));
    
    // toast notifications depending on the result of the mutation
    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note",
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4 bg-background dark:bg-[#1F1F1F]">
      <Image
        src="/empty.png"
        alt="Empty"
        height="300"
        width="300"
        className="dark:hidden"
      />
      <Image
        src="/empty-dark.png"
        alt="Empty"
        height="300"
        width="300"
        className="hidden dark:block"
      />
      <h2 className="text-lg font-medium">
        { /* does user exist? if true, use its first name! */}
        Welcome to {user?.firstName}&apos;s Jotion.
      </h2>
      <Button onClick={onCreate}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create a note.
      </Button>
    </div>
  );
};

export default DocumentsPage;