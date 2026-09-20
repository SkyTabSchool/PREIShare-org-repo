import type { InvestorListing } from "@/types";

/** Fictional draft listing — internal only; not visible to investors. */
export const sampleDraftInfillLand: InvestorListing = {
  id: "lst_ev_1001",
  createdAt: "2026-02-10T14:00:00Z",
  updatedAt: "2026-02-12T09:15:00Z",
  title: "Eastside Infill Land Parcel",
  description:
    "Vacant infill lot near planned transit. Entitlement review is still in progress.",
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
      id: "ctc_mn_01",
      name: "Morgan Nguyen",
      role: "owner_rep",
      email: "morgan.nguyen@example.com",
    },
  ],
  primaryContactId: "ctc_mn_01",
  ownership: {
    contactId: "ctc_mn_01",
    relationship: "primary_owner",
    sharePercent: 100,
  },
};

/** Fictional published listing — visible to investors. */
export const samplePublishedMultifamily: InvestorListing = {
  id: "lst_ev_1002",
  createdAt: "2026-03-01T10:00:00Z",
  updatedAt: "2026-03-15T16:30:00Z",
  title: "Riverfront Multifamily Offering",
  description:
    "Value-add asset near transit with in-place cash flow and unit-mix upside.",
  propertyType: "multifamily",
  status: "published",
  address: {
    line1: "500 River Rd",
    line2: "Suite 200",
    city: "Austin",
    region: "TX",
    postalCode: "78701",
    country: "US",
  },
  financials: {
    askingPrice: 12500000,
    currency: "USD",
    projectedIrrPercent: 12.5,
    capRatePercent: 5.8,
  },
  contacts: [
    {
      id: "ctc_jl_01",
      name: "Jordan Lee",
      role: "broker",
      email: "jordan@example.com",
      phone: "+1-512-555-0142",
    },
    {
      id: "ctc_ap_02",
      name: "Avery Patel",
      role: "owner_rep",
      email: "avery.patel@example.com",
    },
  ],
  primaryContactId: "ctc_jl_01",
  ownership: {
    contactId: "ctc_ap_02",
    relationship: "primary_owner",
    sharePercent: 100,
  },
};

/** Fictional listing with active interest; still structured like published. */
export const sampleUnderOfferOffice: InvestorListing = {
  id: "lst_ev_1003",
  createdAt: "2026-01-20T08:30:00Z",
  updatedAt: "2026-04-02T11:45:00Z",
  title: "Harbor View Office Campus",
  description:
    "Two-building suburban office campus with a credit tenant and remaining term.",
  propertyType: "office",
  status: "under_offer",
  address: {
    line1: "88 Harbor View Pkwy",
    city: "Tampa",
    region: "FL",
    postalCode: "33602",
    country: "US",
  },
  financials: {
    askingPrice: 18750000,
    currency: "USD",
    capRatePercent: 6.4,
  },
  contacts: [
    {
      id: "ctc_rk_03",
      name: "Riley Kim",
      role: "broker",
      phone: "+1-813-555-0198",
    },
  ],
  primaryContactId: "ctc_rk_03",
  ownership: {
    contactId: "ctc_rk_03",
    relationship: "broker",
  },
};

/** Fictional closed deal — `closedAt` is required when status is `sold`. */
export const sampleSoldNeighborhoodRetail: InvestorListing = {
  id: "lst_ev_1004",
  createdAt: "2025-11-04T13:00:00Z",
  updatedAt: "2026-05-22T17:10:00Z",
  title: "Oak Street Neighborhood Retail",
  description:
    "Grocery-anchored strip with local service tenants. Transaction closed in May 2026.",
  propertyType: "retail",
  status: "sold",
  closedAt: "2026-05-18T20:00:00Z",
  address: {
    line1: "410 Oak St",
    line2: "Unit B",
    city: "Denver",
    region: "CO",
    postalCode: "80205",
    country: "US",
  },
  financials: {
    askingPrice: 6200000,
    currency: "USD",
    projectedIrrPercent: 11.2,
    capRatePercent: 6.1,
  },
  contacts: [
    {
      id: "ctc_cs_04",
      name: "Casey Soto",
      role: "owner_rep",
      email: "casey.soto@example.com",
      phone: "+1-303-555-0164",
    },
  ],
  primaryContactId: "ctc_cs_04",
  ownership: {
    contactId: "ctc_cs_04",
    relationship: "primary_owner",
    sharePercent: 75,
  },
};

/** Fictional archived listing — off active browse, retained for history. */
export const sampleArchivedIndustrial: InvestorListing = {
  id: "lst_ev_1005",
  createdAt: "2025-08-12T09:00:00Z",
  updatedAt: "2026-06-01T12:00:00Z",
  title: "North Rail Industrial Warehouse",
  description:
    "Last-mile warehouse near rail. Removed from active browse after the seller paused marketing.",
  propertyType: "industrial",
  status: "archived",
  address: {
    line1: "2500 Rail Yard Blvd",
    city: "Memphis",
    region: "TN",
    postalCode: "38118",
    country: "US",
  },
  financials: {
    askingPrice: 9400000,
    currency: "USD",
    capRatePercent: 7.2,
  },
  contacts: [
    {
      id: "ctc_jw_05",
      name: "Jamie Walsh",
      role: "broker",
      email: "jamie.walsh@example.com",
    },
  ],
  primaryContactId: "ctc_jw_05",
  ownership: {
    contactId: "ctc_jw_05",
    relationship: "co_owner",
    sharePercent: 40,
  },
};

/** All sample listings for browse, tests, and type-check coverage. */
export const sampleInvestorListings: InvestorListing[] = [
  sampleDraftInfillLand,
  samplePublishedMultifamily,
  sampleUnderOfferOffice,
  sampleSoldNeighborhoodRetail,
  sampleArchivedIndustrial,
];
