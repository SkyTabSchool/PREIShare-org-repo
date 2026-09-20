/**
 * Closed ownership-relationship values from the field inventory.
 * Import this alias instead of repeating the union in other files.
 */
export type OwnershipRelationship =
  | "primary_owner"
  | "co_owner"
  | "broker";

/**
 * How one contact relates to the listed asset.
 * Share is optional; if present it is a business percentage, not free text.
 */
export interface Ownership {
  /** Contact this row refers to (`InvestorContact.id`). */
  contactId: string;

  /** Relationship to the asset; exactly one allowed value. */
  relationship: OwnershipRelationship;

  /** Optional ownership share as a business percentage. */
  sharePercent?: number;
}
