import { Loader } from "lucide-react"; // imports a spinner component

import { cva, type VariantProps } from "class-variance-authority"; // useful library to create  variant styles for React components.

import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "text-muted-foreground animate-spin",
  {
    variants: {
      size: {
        default: "h-4 w-4",
        sm: "h-2 w2",
        lg: "h-6 w-6",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      size: "default",
    },
  },
);

// This ensures you can provide any of the defined size variants as props. 
interface SpinnerProps extends VariantProps<typeof spinnerVariants> { };

export const Spinner = ({ size, }: SpinnerProps) => { 
  return (
    <Loader className={cn(spinnerVariants({size}))} />
  );
};