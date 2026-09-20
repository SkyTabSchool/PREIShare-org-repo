/**
 * Nested property address from the field inventory.
 * Street, city, region, postal code, and country travel together —
 * do not flatten this group into a single string.
 */
export interface Address {
  /** Street number and name. */
  line1: string;

  /** Unit/suite or extra street line, if any. */
  line2?: string;

  /** City. */
  city: string;

  /** State, province, or region. */
  region: string;

  /** Postal code. */
  postalCode: string;

  /** Country code or name. */
  country: string;
}
