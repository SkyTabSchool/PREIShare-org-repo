import type { Address } from "./address";
import type { FinancialSummary } from "./financial-summary";
import type { InvestorContact } from "./investor-contact";
import type { ListingStatus } from "./listing-status";
import type { Ownership } from "./ownership";
import type { PropertyType } from "./property-type";

/**
 * Core PREIshare investor listing — identity fields plus nested address,
 * financial summary, investor contacts, and ownership.
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

  /** Nested street / city / region / postal / country group. */
  address: Address;

  /** Nested asking price, currency, and optional return metrics. */
  financials: FinancialSummary;

  /** People tied to the listing; a visible listing needs at least one. */
  contacts: InvestorContact[];

  /** `InvestorContact.id` of the primary person to reach. */
  primaryContactId: string;

  /** How each related contact stands to the asset. */
  ownership: Ownership;
}
