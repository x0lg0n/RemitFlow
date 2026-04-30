export type CatalogAvailabilityStatus = "available" | "pending" | "disabled";

export interface AnchorCatalogRow {
  id: string;
  anchor_id: string | null;
  display_name: string;
  description: string;
  country_code: string;
  supported_currencies: string[];
  supported_countries: string[];
  fee_estimate: string | null;
  rating: string | null;
  website_url: string | null;
  signup_url: string | null;
  logo_url: string | null;
  availability_status: CatalogAvailabilityStatus;
  is_published: boolean;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  user_active: boolean | null;
}

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
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAnchorPreferenceRow {
  id: string;
  user_id: string;
  catalog_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserAnchorPreference {
  id: string;
  userId: string;
  catalogId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnchorSubmissionRow {
  id: string;
  user_id: string;
  anchor_name: string;
  base_url: string | null;
  country_code: string | null;
  supported_currencies: string[];
  notes: string | null;
  submission_status: "pending" | "approved" | "rejected";
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: Date | null;
  catalog_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AnchorSubmission {
  id: string;
  userId: string;
  anchorName: string;
  baseUrl: string | null;
  countryCode: string | null;
  supportedCurrencies: string[];
  notes: string | null;
  submissionStatus: "pending" | "approved" | "rejected";
  reviewNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  catalogId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function rowToCatalogItem(row: AnchorCatalogRow): AnchorCatalogItem {
  return {
    id: row.id,
    anchorId: row.anchor_id,
    displayName: row.display_name,
    description: row.description,
    countryCode: row.country_code,
    supportedCurrencies: row.supported_currencies,
    supportedCountries: row.supported_countries,
    feeEstimate: row.fee_estimate,
    rating: row.rating === null ? null : Number(row.rating),
    websiteUrl: row.website_url,
    signupUrl: row.signup_url,
    logoUrl: row.logo_url,
    availabilityStatus: row.availability_status,
    isPublished: row.is_published,
    notes: row.notes,
    isActiveForUser: Boolean(row.user_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToUserAnchorPreference(row: UserAnchorPreferenceRow): UserAnchorPreference {
  return {
    id: row.id,
    userId: row.user_id,
    catalogId: row.catalog_id,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToAnchorSubmission(row: AnchorSubmissionRow): AnchorSubmission {
  return {
    id: row.id,
    userId: row.user_id,
    anchorName: row.anchor_name,
    baseUrl: row.base_url,
    countryCode: row.country_code,
    supportedCurrencies: row.supported_currencies,
    notes: row.notes,
    submissionStatus: row.submission_status,
    reviewNotes: row.review_notes,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    catalogId: row.catalog_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
