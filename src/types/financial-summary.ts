/**
 * Nested financial summary from the field inventory.
 * Asking price is numeric (not a formatted money string).
 * Optional return metrics may be absent until the team tracks them.
 */
export interface FinancialSummary {
  /** Listed price amount. */
  askingPrice: number;

  /** Currency code (for example `USD`). */
  currency: string;

  /** Optional projected IRR percentage. */
  projectedIrrPercent?: number;

  /** Optional cap rate percentage. */
  capRatePercent?: number;
}
