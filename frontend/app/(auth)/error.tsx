"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AuthError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-10">
      <Alert variant="error">Failed to render login page.</Alert>
      <Button className="mt-3" onClick={reset}>Retry</Button>
    </div>
  );
}
