export type CatalogAvailabilityStatus = "available" | "pending" | "disabled";
export type AnchorSubmissionStatus = "pending" | "approved" | "rejected";

export interface AnchorCatalogItem {
  id: string;
  anchorId: string | null;
  displayName: string;
  description: string;
  countryCode: string;
  supportedCurrencies: string[];
  supportedCountries: string[];
  feeEstimate: string | null;
  rating: number | null;
  websiteUrl: string | null;
  signupUrl: string | null;
  logoUrl: string | null;
  availabilityStatus: CatalogAvailabilityStatus;
  isPublished: boolean;
  notes: string | null;
  isActiveForUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAnchorPreference {
  id: string;
  userId: string;
  catalogId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnchorSubmission {
  id: string;
  userId: string;
  anchorName: string;
  baseUrl: string | null;
  countryCode: string | null;
  supportedCurrencies: string[];
  notes: string | null;
  submissionStatus: AnchorSubmissionStatus;
  reviewNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  catalogId: string | null;
  createdAt: string;
  updatedAt: string;
}
