"use client";

import { useState } from "react";
import { RequireSession } from "@/components/shared/RequireSession";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminAnchors } from "@/hooks/useAdminAnchors";
import type { CatalogAvailabilityStatus } from "@/types/marketplace";

export default function AdminAnchorsPage() {
  const { submissions, catalog, isLoading, error, approve, reject, patchCatalog } = useAdminAnchors();
  const [noteBySubmission, setNoteBySubmission] = useState<Record<string, string>>({});

  return (
    <RequireSession allowedRoles={["admin"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Admin Anchor Control</h1>
        <p className="text-sm text-(--muted)">
          Review user-submitted anchors and publish/unpublish marketplace catalog entries.
        </p>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <Card>
          <CardHeader>
            <CardTitle>Submission Review Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? <Alert>Loading submissions...</Alert> : null}
            {!isLoading && submissions.length === 0 ? <Alert>No submissions found.</Alert> : null}

            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="space-y-3 rounded-lg border border-(--border) bg-(--surface-elevated) p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{submission.anchorName}</p>
                  <Badge
                    variant={
                      submission.submissionStatus === "pending"
                        ? "warning"
                        : submission.submissionStatus === "approved"
                          ? "success"
                          : "secondary"
                    }
                  >
                    {submission.submissionStatus}
                  </Badge>
                </div>
                <p className="text-sm">
                  Country: {submission.countryCode ?? "N/A"} | Currencies:{" "}
                  {submission.supportedCurrencies.join(", ") || "N/A"}
                </p>
                <p className="text-xs text-(--muted)">{submission.notes ?? "No notes"}</p>

                <Input
                  value={noteBySubmission[submission.id] ?? ""}
                  onChange={(event) =>
                    setNoteBySubmission((previous) => ({
                      ...previous,
                      [submission.id]: event.target.value,
                    }))
                  }
                  placeholder="Review note (optional)"
                />

                {submission.submissionStatus === "pending" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        void approve(submission.id, noteBySubmission[submission.id] || undefined)
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        void reject(submission.id, noteBySubmission[submission.id] || undefined)
                      }
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catalog Publish Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {catalog.map((entry) => (
              <div
                key={entry.id}
                className="grid gap-3 rounded-lg border border-(--border) bg-(--surface-elevated) p-4 md:grid-cols-4"
              >
                <div className="md:col-span-2">
                  <p className="font-medium">{entry.displayName}</p>
                  <p className="text-xs text-(--muted)">
                    {entry.countryCode} | {entry.anchorId ?? "Not integrated"}
                  </p>
                </div>
                <div>
                  <Select
                    value={entry.availabilityStatus}
                    onValueChange={(value) =>
                      void patchCatalog(entry.id, {
                        availabilityStatus: value as CatalogAvailabilityStatus,
                      })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={entry.isPublished ? "secondary" : "primary"}
                    onClick={() =>
                      void patchCatalog(entry.id, { isPublished: !entry.isPublished })
                    }
                  >
                    {entry.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </RequireSession>
  );
}
