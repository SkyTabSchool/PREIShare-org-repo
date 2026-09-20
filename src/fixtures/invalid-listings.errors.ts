/**
 * Teaching fixture: objects that look like investor listings but violate
 * `InvestorListing` (and nested types). TypeScript is supposed to reject
 * every export in this file.
 *
 * Do not "fix" these objects. Do not silence errors with `any`, `@ts-ignore`,
 * or `@ts-expect-error`. The point is that `npm run typecheck` reports them.
 *
 * Import this module only when you want to see those compile errors.
 * Application routes and UI must not import it.
 */
import type { InvestorListing } from "@/types";

/**
 * INTENTIONAL TYPE ERROR: `status` is not one of the closed lifecycle values.
 * Domain brief rejects aliases such as `LIVE`.
 */
export const invalidStatusLive: InvestorListing = {
  id: "lst_bad_status",
  createdAt: "2026-03-01T10:00:00Z",
  updatedAt: "2026-03-15T16:30:00Z",
  title: "Riverfront Multifamily Offering",
  description: "Value-add asset near transit with in-place cash flow.",
  propertyType: "multifamily",
  status: "LIVE",
  address: {
    line1: "500 River Rd",
    city: "Austin",
    region: "TX",
    postalCode: "78701",
    country: "US",
  },
  financials: {
    askingPrice: 12500000,
    currency: "USD",
  },
  contacts: [
    {
      id: "ctc_bad_status",
      name: "Jordan Lee",
      role: "broker",
      email: "jordan@example.com",
    },
  ],
  primaryContactId: "ctc_bad_status",
  ownership: {
    contactId: "ctc_bad_status",
    relationship: "broker",
  },
};

/**
 * INTENTIONAL TYPE ERROR: `propertyType` is not in the closed asset-class list.
 * Spellings such as `house` are not allowed.
 */
export const invalidPropertyTypeHouse: InvestorListing = {
  id: "lst_bad_ptype",
  createdAt: "2026-02-10T14:00:00Z",
  updatedAt: "2026-02-12T09:15:00Z",
  title: "Eastside Infill Land Parcel",
  description: "Vacant infill lot near planned transit.",
  propertyType: "house",
  status: "draft",
  address: {
    line1: "1200 Willow Creek Dr",
    city: "Austin",
    region: "TX",
    postalCode: "78702",
    country: "US",
  },
  financials: {
    askingPrice: 1850000,
    currency: "USD",
  },
  contacts: [
    {
      id: "ctc_bad_ptype",
      name: "Morgan Nguyen",
      role: "owner_rep",
      email: "morgan.nguyen@example.com",
    },
  ],
  primaryContactId: "ctc_bad_ptype",
  ownership: {
    contactId: "ctc_bad_ptype",
    relationship: "primary_owner",
    sharePercent: 100,
  },
};

/**
 * INTENTIONAL TYPE ERROR: address must stay a nested object, not one string.
 * Flattening it is how city or postal code disappear on a later screen.
 */
export const invalidFlattenedAddress: InvestorListing = {
  id: "lst_bad_address",
  createdAt: "2026-01-20T08:30:00Z",
  updatedAt: "2026-04-02T11:45:00Z",
  title: "Harbor View Office Campus",
  description: "Two-building suburban office campus with a credit tenant.",
  propertyType: "office",
  status: "published",
  address: "88 Harbor View Pkwy, Tampa, FL 33602, US",
  financials: {
    askingPrice: 18750000,
    currency: "USD",
  },
  contacts: [
    {
      id: "ctc_bad_address",
      name: "Riley Kim",
      role: "broker",
      phone: "+1-813-555-0198",
    },
  ],
  primaryContactId: "ctc_bad_address",
  ownership: {
    contactId: "ctc_bad_address",
    relationship: "broker",
  },
};

/**
 * INTENTIONAL TYPE ERROR: asking price must be a number, not a money string.
 */
export const invalidAskingPriceString: InvestorListing = {
  id: "lst_bad_price",
  createdAt: "2026-03-01T10:00:00Z",
  updatedAt: "2026-03-15T16:30:00Z",
  title: "Riverfront Multifamily Offering",
  description: "Value-add asset near transit with in-place cash flow.",
  propertyType: "multifamily",
  status: "published",
  address: {
    line1: "500 River Rd",
    city: "Austin",
    region: "TX",
    postalCode: "78701",
    country: "US",
  },
  financials: {
    askingPrice: "$12,500,000",
    currency: "USD",
  },
  contacts: [
    {
      id: "ctc_bad_price",
      name: "Jordan Lee",
      role: "broker",
      email: "jordan@example.com",
    },
  ],
  primaryContactId: "ctc_bad_price",
  ownership: {
    contactId: "ctc_bad_price",
    relationship: "broker",
  },
};

/**
 * INTENTIONAL TYPE ERROR: each contact needs at least one reachable channel
 * (`email` or `phone`). Name and role alone are not enough.
 */
export const invalidContactNoChannel: InvestorListing = {
  id: "lst_bad_contact",
  createdAt: "2026-03-01T10:00:00Z",
  updatedAt: "2026-03-15T16:30:00Z",
  title: "Riverfront Multifamily Offering",
  description: "Value-add asset near transit with in-place cash flow.",
  propertyType: "multifamily",
  status: "published",
  address: {
    line1: "500 River Rd",
    city: "Austin",
    region: "TX",
    postalCode: "78701",
    country: "US",
  },
  financials: {
    askingPrice: 12500000,
    currency: "USD",
  },
  contacts: [
    {
      id: "ctc_bad_contact",
      name: "Jordan Lee",
      role: "broker",
    },
  ],
  primaryContactId: "ctc_bad_contact",
  ownership: {
    contactId: "ctc_bad_contact",
    relationship: "broker",
  },
};

/**
 * INTENTIONAL TYPE ERROR: a listing needs at least one investor contact.
 * An empty `contacts` array is how "who do we call?" disappears.
 */
export const invalidEmptyContacts: InvestorListing = {
  id: "lst_bad_empty_contacts",
  createdAt: "2026-03-01T10:00:00Z",
  updatedAt: "2026-03-15T16:30:00Z",
  title: "Riverfront Multifamily Offering",
  description: "Value-add asset near transit with in-place cash flow.",
  propertyType: "multifamily",
  status: "published",
  address: {
    line1: "500 River Rd",
    city: "Austin",
    region: "TX",
    postalCode: "78701",
    country: "US",
  },
  financials: {
    askingPrice: 12500000,
    currency: "USD",
  },
  contacts: [],
  primaryContactId: "ctc_missing",
  ownership: {
    contactId: "ctc_missing",
    relationship: "broker",
  },
};

/**
 * INTENTIONAL TYPE ERROR: ownership `relationship` is a closed list.
 * Free-text labels such as `majority investor` are not allowed.
 */
export const invalidOwnershipRelationship: InvestorListing = {
  id: "lst_bad_owner",
  createdAt: "2026-02-10T14:00:00Z",
  updatedAt: "2026-02-12T09:15:00Z",
  title: "Eastside Infill Land Parcel",
  description: "Vacant infill lot near planned transit.",
  propertyType: "land",
  status: "draft",
  address: {
    line1: "1200 Willow Creek Dr",
    city: "Austin",
    region: "TX",
    postalCode: "78702",
    country: "US",
  },
  financials: {
    askingPrice: 1850000,
    currency: "USD",
  },
  contacts: [
    {
      id: "ctc_bad_owner",
      name: "Morgan Nguyen",
      role: "owner_rep",
      email: "morgan.nguyen@example.com",
    },
  ],
  primaryContactId: "ctc_bad_owner",
  ownership: {
    contactId: "ctc_bad_owner",
    relationship: "majority investor",
    sharePercent: 100,
  },
};

/**
 * INTENTIONAL TYPE ERROR: `closedAt` is required when `status` is `sold`.
 */
export const invalidSoldMissingClosedAt: InvestorListing = {
  id: "lst_bad_sold",
  createdAt: "2025-11-04T13:00:00Z",
  updatedAt: "2026-05-22T17:10:00Z",
  title: "Oak Street Neighborhood Retail",
  description: "Grocery-anchored strip. Transaction closed in May 2026.",
  propertyType: "retail",
  status: "sold",
  address: {
    line1: "410 Oak St",
    city: "Denver",
    region: "CO",
    postalCode: "80205",
    country: "US",
  },
  financials: {
    askingPrice: 6200000,
    currency: "USD",
  },
  contacts: [
    {
      id: "ctc_bad_sold",
      name: "Casey Soto",
      role: "owner_rep",
      email: "casey.soto@example.com",
    },
  ],
  primaryContactId: "ctc_bad_sold",
  ownership: {
    contactId: "ctc_bad_sold",
    relationship: "primary_owner",
    sharePercent: 75,
  },
};

/**
 * INTENTIONAL TYPE ERROR: `closedAt` is only valid on sold listings.
 * A draft must not carry a close date.
 */
export const invalidDraftWithClosedAt: InvestorListing = {
  id: "lst_bad_draft_closed",
  createdAt: "2026-02-10T14:00:00Z",
  updatedAt: "2026-02-12T09:15:00Z",
  title: "Eastside Infill Land Parcel",
  description: "Vacant infill lot near planned transit.",
  propertyType: "land",
  status: "draft",
  closedAt: "2026-05-18T20:00:00Z",
  address: {
    line1: "1200 Willow Creek Dr",
    city: "Austin",
    region: "TX",
    postalCode: "78702",
    country: "US",
  },
  financials: {
    askingPrice: 1850000,
    currency: "USD",
  },
  contacts: [
    {
      id: "ctc_bad_draft_closed",
      name: "Morgan Nguyen",
      role: "owner_rep",
      email: "morgan.nguyen@example.com",
    },
  ],
  primaryContactId: "ctc_bad_draft_closed",
  ownership: {
    contactId: "ctc_bad_draft_closed",
    relationship: "primary_owner",
    sharePercent: 100,
  },
};
