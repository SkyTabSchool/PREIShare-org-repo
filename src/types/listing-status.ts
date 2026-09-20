/**
 * Closed listing lifecycle statuses from the field inventory.
 * Keep this string union as the single source of allowed status spellings.
 */
export type ListingStatus =
  | "draft"
  | "published"
  | "under_offer"
  | "sold"
  | "archived";
