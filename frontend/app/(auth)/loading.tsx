import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-10">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
