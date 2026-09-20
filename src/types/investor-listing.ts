import type { Address } from "./address";
import type { FinancialSummary } from "./financial-summary";
import type { InvestorContact } from "./investor-contact";
import type { ListingStatus } from "./listing-status";
import type { Ownership } from "./ownership";
import type { PropertyType } from "./property-type";

/** Fields every investor listing has, regardless of status. */
export interface InvestorListingBase {
  /** Stable identity — do not reassign after create. */
  readonly id: string;
  /** Set once when the row is created. */
  readonly createdAt: string;
  /** May change when the listing is edited; still not a business key. */
  readonly updatedAt: string;

  /** Short public headline shown in search results and cards. */
  title: string;

  /** Longer investor-facing description of the opportunity. */
  description: string;

  /** Asset class; exactly one allowed property-type value. */
  propertyType: PropertyType;

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

/**
 * Discriminated union: TypeScript uses `status` to know which shape you have.
 * Example rule: `closedAt` is required only when status is `sold`.
 */
export type InvestorListing =
  | (InvestorListingBase & {
      status: Exclude<ListingStatus, "sold">;
      /** Not used unless the listing is sold. */
      closedAt?: undefined;
    })
  | (InvestorListingBase & {
      status: "sold";
      /** ISO date string — required when the listing is sold. */
      closedAt: string;
    });

export type ClosedInvestorListing = Extract<InvestorListing, { status: "sold" }>;
export type OpenInvestorListing = Exclude<InvestorListing, { status: "sold" }>;
