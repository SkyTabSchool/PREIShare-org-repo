/**
 * Closed listing lifecycle statuses from the field inventory.
 * Import this alias instead of repeating the union in other files.
 */
export type ListingStatus =
  | "draft"
  | "published"
  | "under_offer"
  | "sold"
  | "archived";
