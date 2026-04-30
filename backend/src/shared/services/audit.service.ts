import { pool } from "../config/database";
import type { SessionRole } from "./role.service";

export interface AuditEventInput {
  actorUserId?: string | null;
  actorRole?: SessionRole | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Persist an audit event. Failures are logged but do not crash request flow.
 */
export async function logAuditEvent(input: AuditEventInput): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO audit_events (
         actor_user_id,
         actor_role,
         action,
         target_type,
         target_id,
         metadata
       ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        input.actorUserId ?? null,
        input.actorRole ?? null,
        input.action,
        input.targetType,
        input.targetId ?? null,
        input.metadata ?? null,
      ]
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[AUDIT] Failed to persist audit event ${input.action}: ${message}`);
  }
}
