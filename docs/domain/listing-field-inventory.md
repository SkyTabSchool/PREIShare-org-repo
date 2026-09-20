# Listing Field Inventory (PREIshare)

Use this table as the source of truth when defining TypeScript types. Field names are suggestions the types may adopt; meanings and shapes are mandatory.

Companion contract: [investor-listing-domain-brief.md](./investor-listing-domain-brief.md). If this inventory and a later type disagree with that brief, the brief wins. Examples are fictional; do not paste private investor data here.

**Required vs optional:** `yes` means the field must exist on a complete listing. `yes for published+` means it must exist when `status` is `published`, `under_offer`, or `sold`. Drafts may still be incomplete while a listing editor works. Reviewer / compliance does not publish until published+ required fields hold.

**Shapes:** `text` is a string; `number` is numeric (not a formatted money string); `datetime text` is a timestamp as text (ISO-8601 examples below; exact format is a later decision); `fixed choice` is a closed list (union candidate)—never free text; nested objects and lists stay nested.

## Identity and classification

| Field | Meaning | Shape | Required? | Example / allowed values |
| --- | --- | --- | --- | --- |
| id | Stable unique id for the listing | text | yes | `lst_ev_1001` |
| title | Short name shown to investors | text | yes | `Riverfront Multifamily Offering` |
| description | Longer investor-facing summary | text | yes for published+ | `Value-add asset near transit...` |
| status | Lifecycle state (exactly one at a time) | fixed choice | yes | `draft`, `published`, `under_offer`, `sold`, `archived` |
| propertyType | Asset class | fixed choice | yes | `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, `land` |
| createdAt | When the listing record was created | datetime text | yes | `2026-03-01T10:00:00Z` |
| updatedAt | Last meaningful edit | datetime text | yes | `2026-03-15T16:30:00Z` |

Status allowed values only (no aliases, different capitalization, or free-text substitutes such as `Active`, `LIVE`, `pending`, or `under_contract`):

- `draft` — internal only; not visible to investors.
- `published` — visible to investors; must meet full validity rules.
- `under_offer` — active interest; still structured like a published listing.
- `sold` — closed deal; retained for history.
- `archived` — removed from active browse; not deleted.

Property type allowed values only (spellings such as `multi_family`, `house`, or `commercial` are not in this set): `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, `land`.

## Address (nested object)

Do not flatten address into a single string. Street, city, region/state, postal code, and country travel together.

| Field | Meaning | Shape | Required? | Example |
| --- | --- | --- | --- | --- |
| address.line1 | Street number and name | text | yes for published+ | `500 River Rd` |
| address.line2 | Unit/suite or extra street line (if any) | text | no | `Suite 200` |
| address.city | City | text | yes for published+ | `Austin` |
| address.region | State/province/region | text | yes for published+ | `TX` |
| address.postalCode | Postal code | text | yes for published+ | `78701` |
| address.country | Country code or name | text | yes for published+ | `US` |

## Financial summary (nested object)

A missing asking price is not a complete published listing. Optional return metrics may be absent until the team agrees to track them.

| Field | Meaning | Shape | Required? | Example |
| --- | --- | --- | --- | --- |
| financials.askingPrice | Listed price amount | number | yes for published+ | `12500000` |
| financials.currency | Currency code | fixed choice / text code | yes for published+ | `USD` |
| financials.projectedIrrPercent | Optional projected IRR | number | no | `12.5` |
| financials.capRatePercent | Optional cap rate | number | no | `5.8` |

## Investor contacts (list of nested objects)

Contacts are people, not free-text notes. A listing investors can see needs at least one contact. Each contact has a name and at least one reachable channel (email or phone). Role describes why they appear; it is not the closed ownership-relationship list.

| Field | Meaning | Shape | Required? | Example |
| --- | --- | --- | --- | --- |
| contacts[].name | Person or firm name | text | yes (each contact) | `Jordan Lee` |
| contacts[].role | Why they appear on the listing | text (suggested labels) | yes (each contact) | `broker`, `owner_rep` |
| contacts[].email | Email if used | text | one of email/phone required | `jordan@example.com` |
| contacts[].phone | Phone if used | text | one of email/phone required | `+1-512-555-0142` |

## Ownership (list of nested objects tied to contacts)

Ownership is a closed relationship, not a sentence typed differently every time. Each ownership row points at a contact. Share is optional; if present it is a business percentage, not free text.

| Field | Meaning | Shape | Required? | Example |
| --- | --- | --- | --- | --- |
| ownership[].contactNameOrId | Which contact the row refers to | text | yes (each row) | `Jordan Lee` or contact id |
| ownership[].relationship | Relationship to the asset | fixed choice | yes (each row) | `primary_owner`, `co_owner`, `broker` |
| ownership[].sharePercent | Optional ownership share | number | no | `60` |

Ownership relationship allowed values only: `primary_owner`, `co_owner`, `broker`.

## Inventory rules (must hold)

1. Do not invent extra top-level groups beyond identity, address, financials, contacts, and ownership without updating the domain brief.
2. Status and propertyType must remain closed lists (union candidates)—never free text.
3. Address and financials are nested objects, not flat optional strings only.
4. Contacts are a list (array); a valid published listing needs at least one contact.
5. Every required field above must appear in later TypeScript interfaces unless the decision record deliberately relaxes it.
6. Ownership `relationship` is a closed list (`primary_owner`, `co_owner`, `broker`)—never free text.
7. Optional fields (`address.line2`, `financials.projectedIrrPercent`, `financials.capRatePercent`, `ownership[].sharePercent`) may be absent; required fields must never be missing for `published`, `under_offer`, or `sold`.
