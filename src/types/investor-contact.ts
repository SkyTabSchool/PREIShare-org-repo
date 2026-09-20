/**
 * A person tied to a listing — not a free-text note.
 * Each contact has a name and at least one reachable channel (email or phone).
 * Role describes why they appear; it is not the closed ownership-relationship list.
 */
interface InvestorContactBase {
  /** Stable unique id; used by `primaryContactId` and ownership rows. */
  id: string;

  /** Person or firm name. */
  name: string;

  /** Why they appear on the listing (for example `broker` or `owner_rep`). */
  role: string;
}

export type InvestorContact =
  | (InvestorContactBase & { email: string; phone?: string })
  | (InvestorContactBase & { phone: string; email?: string });
