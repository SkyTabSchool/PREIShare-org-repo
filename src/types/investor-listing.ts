import type { ListingStatus } from "./listing-status";
import type { PropertyType } from "./property-type";

/**
 * Core PREIshare investor listing — scalar fields plus closed unions.
 * Nested types (address, financials, contacts) are added in later steps.
 */
export interface InvestorListing {
  /** Stable unique id for this listing (assigned by the system). */
  id: string;

  /** Short public headline shown in search results and cards. */
  title: string;

  /** Longer investor-facing description of the opportunity. */
  description: string;

  /** Lifecycle state; exactly one allowed value at a time. */
  status: ListingStatus;

  /** Asset class; exactly one allowed property-type value. */
  propertyType: PropertyType;

  /** ISO-8601 datetime string when the listing was first created. */
  createdAt: string;

  /** ISO-8601 datetime string when the listing was last updated. */
  updatedAt: string;

  /** Asking price in USD. */
  askingPrice: number;
}
