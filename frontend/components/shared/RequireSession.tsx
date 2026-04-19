"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useSession";
import type { SessionRole } from "@/types/auth";

interface RequireSessionProps {
  children: ReactNode;
  allowedRoles?: SessionRole[];
}

export function RequireSession({ children, allowedRoles }: RequireSessionProps) {
  const router = useRouter();
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/login");
      return;
    }

    if (!isLoading && session && allowedRoles && !allowedRoles.includes(session.role)) {
      router.replace("/dashboard");
    }
  }, [allowedRoles, isLoading, router, session]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!session) {
    return <Alert>Redirecting to login...</Alert>;
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return <Alert variant="error">You do not have access to this page.</Alert>;
  }

  return <>{children}</>;
}
