import { randomUUID } from "node:crypto";
import { pool } from "../../shared/config/database";
import { redis } from "../../shared/config/redis";
import {
  AnchorCatalogRow,
  AnchorSubmissionRow,
  UserAnchorPreferenceRow,
  rowToAnchorSubmission,
  rowToCatalogItem,
  rowToUserAnchorPreference,
  type AnchorCatalogItem,
  type AnchorSubmission,
  type CatalogAvailabilityStatus,
  type UserAnchorPreference,
} from "../../shared/types/marketplace.types";

export class MarketplaceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

interface CatalogStateRow {
  id: string;
  anchor_id: string | null;
  availability_status: CatalogAvailabilityStatus;
  is_published: boolean;
}

function toCatalogSubmissionId(anchorName: string): string {
  const normalized = anchorName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `${normalized || "anchor"}_${randomUUID().slice(0, 8)}`;
}

/** Return published catalog entries, optionally enriched with user activation state. */
export async function listCatalog(userId?: string): Promise<AnchorCatalogItem[]> {
  const params: Array<string> = [];
  let userJoin = "FALSE AS user_active";

  if (userId) {
    params.push(userId);
    userJoin = `COALESCE(p.is_active, FALSE) AS user_active`;
  }

  const preferenceJoin = userId
    ? `LEFT JOIN user_anchor_preferences p
         ON p.catalog_id = c.id
        AND p.user_id = $1`
    : "";

  const { rows } = await pool.query<AnchorCatalogRow>(
    `SELECT
       c.*,
       ${userJoin}
     FROM anchor_catalog c
     ${preferenceJoin}
     WHERE c.is_published = TRUE
     ORDER BY c.display_name ASC`,
    params
  );

  return rows.map(rowToCatalogItem);
}

/** Return user anchor preferences (active and inactive) for management screens. */
export async function getUserAnchorPreferences(userId: string): Promise<UserAnchorPreference[]> {
  const { rows } = await pool.query<UserAnchorPreferenceRow>(
    `SELECT id, user_id, catalog_id, is_active, created_at, updated_at
     FROM user_anchor_preferences
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows.map(rowToUserAnchorPreference);
}

/** Activate a catalog anchor for a user. */
export async function activateUserAnchor(userId: string, catalogId: string): Promise<UserAnchorPreference> {
  const { rows: catalogRows } = await pool.query<CatalogStateRow>(
    `SELECT id, anchor_id, availability_status, is_published
     FROM anchor_catalog
     WHERE id = $1
     LIMIT 1`,
    [catalogId]
  );

  if (catalogRows.length === 0) {
    throw new MarketplaceError(404, "CATALOG_ANCHOR_NOT_FOUND", "Catalog anchor not found");
  }

  const catalog = catalogRows[0];

  if (!catalog.is_published) {
    throw new MarketplaceError(400, "CATALOG_ANCHOR_UNPUBLISHED", "Catalog anchor is not published");
  }

  if (catalog.availability_status !== "available") {
    throw new MarketplaceError(400, "CATALOG_ANCHOR_UNAVAILABLE", "Catalog anchor is not available");
  }

  if (!catalog.anchor_id) {
    throw new MarketplaceError(
      400,
      "CATALOG_ANCHOR_NOT_INTEGRATED",
      "Catalog anchor is not integrated for transaction routing yet"
    );
  }

  const anchorCheck = await pool.query<{ id: string }>(
    "SELECT id FROM anchors WHERE id = $1 AND is_active = TRUE LIMIT 1",
    [catalog.anchor_id]
  );

  if (anchorCheck.rows.length === 0) {
    throw new MarketplaceError(400, "ANCHOR_INACTIVE", "Integrated anchor is currently inactive");
  }

  const { rows } = await pool.query<UserAnchorPreferenceRow>(
    `INSERT INTO user_anchor_preferences (user_id, catalog_id, is_active)
     VALUES ($1, $2, TRUE)
     ON CONFLICT (user_id, catalog_id)
     DO UPDATE SET is_active = TRUE, updated_at = NOW()
     RETURNING id, user_id, catalog_id, is_active, created_at, updated_at`,
    [userId, catalogId]
  );

  await redis.del(`rates:user:${userId}`);
  return rowToUserAnchorPreference(rows[0]);
}

/** Deactivate a catalog anchor for a user. */
export async function deactivateUserAnchor(userId: string, catalogId: string): Promise<boolean> {
  const result = await pool.query(
    `UPDATE user_anchor_preferences
     SET is_active = FALSE, updated_at = NOW()
     WHERE user_id = $1 AND catalog_id = $2`,
    [userId, catalogId]
  );

  const wasUpdated = (result.rowCount ?? 0) > 0;
  if (wasUpdated) {
    await redis.del(`rates:user:${userId}`);
  }

  return wasUpdated;
}

/** List technical anchor IDs enabled by user preferences. */
export async function getUserAllowedTechnicalAnchorIds(userId: string): Promise<string[]> {
  const { rows } = await pool.query<{ anchor_id: string }>(
    `SELECT c.anchor_id
     FROM user_anchor_preferences p
     INNER JOIN anchor_catalog c
       ON c.id = p.catalog_id
     INNER JOIN anchors a
       ON a.id = c.anchor_id
     WHERE p.user_id = $1
       AND p.is_active = TRUE
       AND c.is_published = TRUE
       AND c.availability_status = 'available'
       AND c.anchor_id IS NOT NULL
       AND a.is_active = TRUE`,
    [userId]
  );

  return rows.map((row) => row.anchor_id);
}

/** Check whether a technical anchor is active for the user via catalog preferences. */
export async function isTechnicalAnchorEnabledForUser(userId: string, anchorId: string): Promise<boolean> {
  const { rows } = await pool.query<{ enabled: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM user_anchor_preferences p
       INNER JOIN anchor_catalog c ON c.id = p.catalog_id
       INNER JOIN anchors a ON a.id = c.anchor_id
       WHERE p.user_id = $1
         AND p.is_active = TRUE
         AND c.anchor_id = $2
         AND c.is_published = TRUE
         AND c.availability_status = 'available'
         AND a.is_active = TRUE
     ) AS enabled`,
    [userId, anchorId]
  );

  return rows[0]?.enabled ?? false;
}

/** Create a new anchor submission from an end-user. */
export async function createAnchorSubmission(input: {
  userId: string;
  anchorName: string;
  baseUrl?: string;
  countryCode?: string;
  supportedCurrencies?: string[];
  notes?: string;
}): Promise<AnchorSubmission> {
  const { rows } = await pool.query<AnchorSubmissionRow>(
    `INSERT INTO anchor_submissions (
       user_id,
       anchor_name,
       base_url,
       country_code,
       supported_currencies,
       notes,
       submission_status
     ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
     RETURNING *`,
    [
      input.userId,
      input.anchorName,
      input.baseUrl ?? null,
      input.countryCode ?? null,
      input.supportedCurrencies ?? [],
      input.notes ?? null,
    ]
  );

  return rowToAnchorSubmission(rows[0]);
}

/** List anchor submissions for admin review. */
export async function listAnchorSubmissions(status?: "pending" | "approved" | "rejected"): Promise<AnchorSubmission[]> {
  const params: Array<string> = [];
  const whereClause = status ? "WHERE submission_status = $1" : "";
  if (status) params.push(status);

  const { rows } = await pool.query<AnchorSubmissionRow>(
    `SELECT *
     FROM anchor_submissions
     ${whereClause}
     ORDER BY created_at DESC`,
    params
  );

  return rows.map(rowToAnchorSubmission);
}

/** Approve a pending submission and publish a pending catalog entry. */
export async function approveAnchorSubmission(input: {
  submissionId: string;
  reviewerUserId: string;
  reviewNotes?: string;
}): Promise<AnchorSubmission> {
  const { rows } = await pool.query<AnchorSubmissionRow>(
    `SELECT *
     FROM anchor_submissions
     WHERE id = $1
     LIMIT 1`,
    [input.submissionId]
  );

  if (rows.length === 0) {
    throw new MarketplaceError(404, "SUBMISSION_NOT_FOUND", "Anchor submission not found");
  }

  const existing = rows[0];
  if (existing.submission_status !== "pending") {
    throw new MarketplaceError(400, "SUBMISSION_ALREADY_REVIEWED", "Submission has already been reviewed");
  }

  const catalogId = toCatalogSubmissionId(existing.anchor_name);

  await pool.query(
    `INSERT INTO anchor_catalog (
       id,
       anchor_id,
       display_name,
       description,
       country_code,
       supported_currencies,
       supported_countries,
       fee_estimate,
       rating,
       website_url,
       signup_url,
       logo_url,
       availability_status,
       is_published,
       notes
     ) VALUES ($1, NULL, $2, $3, $4, $5, ARRAY[]::TEXT[], NULL, NULL, NULL, NULL, NULL, 'pending', TRUE, $6)
     ON CONFLICT (id) DO NOTHING`,
    [
      catalogId,
      existing.anchor_name,
      existing.notes ?? "Community-submitted anchor",
      existing.country_code ?? "US",
      existing.supported_currencies,
      "Published from community submission. Awaiting technical integration.",
    ]
  );

  const { rows: updatedRows } = await pool.query<AnchorSubmissionRow>(
    `UPDATE anchor_submissions
     SET submission_status = 'approved',
         review_notes = $1,
         reviewed_by = $2,
         reviewed_at = NOW(),
         catalog_id = $3,
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [input.reviewNotes ?? null, input.reviewerUserId, catalogId, input.submissionId]
  );

  await redis.del("rates:all_active");
  await redis.del(`rates:user:${input.reviewerUserId}`);
  return rowToAnchorSubmission(updatedRows[0]);
}

/** Reject a pending submission. */
export async function rejectAnchorSubmission(input: {
  submissionId: string;
  reviewerUserId: string;
  reviewNotes?: string;
}): Promise<AnchorSubmission> {
  const { rows } = await pool.query<AnchorSubmissionRow>(
    `UPDATE anchor_submissions
     SET submission_status = 'rejected',
         review_notes = $1,
         reviewed_by = $2,
         reviewed_at = NOW(),
         updated_at = NOW()
     WHERE id = $3
       AND submission_status = 'pending'
     RETURNING *`,
    [input.reviewNotes ?? null, input.reviewerUserId, input.submissionId]
  );

  if (rows.length === 0) {
    throw new MarketplaceError(404, "SUBMISSION_NOT_FOUND", "Pending submission not found");
  }

  return rowToAnchorSubmission(rows[0]);
}

/** Admin catalog update for publish/unpublish and quality metadata. */
export async function updateCatalogEntry(input: {
  catalogId: string;
  isPublished?: boolean;
  availabilityStatus?: CatalogAvailabilityStatus;
  rating?: number | null;
  notes?: string | null;
  feeEstimate?: string | null;
  displayName?: string;
}): Promise<AnchorCatalogItem> {
  const fields: string[] = [];
  const values: Array<string | number | boolean | null> = [];

  if (typeof input.isPublished === "boolean") {
    values.push(input.isPublished);
    fields.push(`is_published = $${values.length}`);
  }

  if (input.availabilityStatus) {
    values.push(input.availabilityStatus);
    fields.push(`availability_status = $${values.length}`);
  }

  if (typeof input.rating === "number" || input.rating === null) {
    values.push(input.rating);
    fields.push(`rating = $${values.length}`);
  }

  if (typeof input.notes === "string" || input.notes === null) {
    values.push(input.notes);
    fields.push(`notes = $${values.length}`);
  }

  if (typeof input.feeEstimate === "string" || input.feeEstimate === null) {
    values.push(input.feeEstimate);
    fields.push(`fee_estimate = $${values.length}`);
  }

  if (typeof input.displayName === "string") {
    values.push(input.displayName);
    fields.push(`display_name = $${values.length}`);
  }

  if (fields.length === 0) {
    throw new MarketplaceError(400, "NO_UPDATES", "No catalog updates requested");
  }

  fields.push("updated_at = NOW()");
  values.push(input.catalogId);

  const { rows } = await pool.query<AnchorCatalogRow>(
    `UPDATE anchor_catalog
     SET ${fields.join(", ")}
     WHERE id = $${values.length}
     RETURNING ctid, id, anchor_id, display_name, description, country_code,
       supported_currencies, supported_countries, fee_estimate, rating,
       website_url, signup_url, logo_url, availability_status, is_published,
       notes, created_at, updated_at, FALSE AS user_active`,
    values
  );

  if (rows.length === 0) {
    throw new MarketplaceError(404, "CATALOG_ANCHOR_NOT_FOUND", "Catalog anchor not found");
  }

  await redis.del("rates:all_active");
  const { rows: activeUserRows } = await pool.query<{ user_id: string }>(
    `SELECT DISTINCT p.user_id
     FROM user_anchor_preferences p
     WHERE p.catalog_id = $1
       AND p.is_active = TRUE`,
    [input.catalogId]
  );

  if (activeUserRows.length > 0) {
    await redis.del(...activeUserRows.map((row) => `rates:user:${row.user_id}`));
  }

  return rowToCatalogItem(rows[0]);
}
