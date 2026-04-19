"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <div className="space-y-4 py-8">
      <Alert variant="error">Failed to load app page.</Alert>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
