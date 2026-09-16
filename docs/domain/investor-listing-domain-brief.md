# Investor Listing Domain Brief

## Purpose

Define what an investor listing is in PREIshare business language so TypeScript types in later steps match real workflows—not invented fields.

PREIshare is a real-estate intelligence product: it helps investors make intelligent decisions. An **investor listing** is a property opportunity the team stores and shows. A **type** (added later) is a label that describes what kind of data the code expects. **Compile time** is when TypeScript checks those labels, before the app runs.

Today, loose objects and ad-hoc JSON let bugs reach production: a missing price, a status spelled three different ways, or a nested address field that vanishes on one screen. This brief is the shared contract those later types must honor.

## Actors

An **actor** is a person or system that creates, changes, reviews, or depends on listing data.

- **Listing editor (internal ops)** — creates and updates listings before investors see them.
- **Investor (end user)** — browses published listings and relies on complete, consistent data.
- **Reviewer / compliance** — checks that status, price, and contact info are trustworthy before publish.
- **Future systems** — website UI, API, and database will all read the same listing shape.

## Business goals

- One shared definition of a listing across screens and teammates.
- Catch missing or invalid data before production (at compile time once types exist).
- Support nested real-world data: address, financial summary, investor contacts, ownership.

## Listing lifecycle statuses (allowed values only)

A **lifecycle** is the path a listing takes over time. A **status** is the listing’s current place on that path. Use these exact values. Do not add aliases, different capitalization, or free-text substitutes (`Active`, `LIVE`, `pending`, and `under_contract` are not valid here).

- `draft` — internal only; not visible to investors.
- `published` — visible to investors; must meet full validity rules.
- `under_offer` — active interest; still structured like a published listing.
- `sold` — closed deal; retained for history.
- `archived` — removed from active browse; not deleted.

A listing has exactly one status at a time. Typical movement is `draft` → `published` → `under_offer` → `sold`, with `archived` as the off-browse end state. This brief does not define a workflow engine—only the allowed labels.

## Nested data groups

A **nested data group** is a cluster of related fields stored together as one object inside the listing. Nesting is what stops an address part (or a contact) from living at the top level on one screen and vanishing on another. Do not flatten these groups into a single string or scatter their fields across the listing root.

- **Address** — street line(s), city, region/state, postal code, country.
- **Financial summary** — asking price, currency, optional projected return metrics the team agrees to track.
- **Investor contacts** — one or more people tied to the listing (name, role, email or phone).
- **Ownership** — how contacts relate to the asset (e.g., primary owner, co-owner, broker) and optional ownership share.

**Address** must stay a group: street, city, region/state, postal code, and country travel together. Replacing the group with one address string is how a city (or postal code) disappears on a later screen.

**Financial summary** must include a numeric asking price and a currency code. Optional return metrics may be absent until the team agrees to track them. A missing asking price is not a complete published listing.

**Investor contacts** are people, not free-text notes. Each contact has a name and at least one reachable channel (email or phone). A listing that investors can see needs at least one such contact so reviewer / compliance can trust who to reach.

**Ownership** is a closed relationship, not a sentence someone types differently every time. The agreed relationship values for this topic are:

- `primary_owner`
- `co_owner`
- `broker`

Ownership share is optional. If present, it is a business percentage tied to that relationship—not a second free-text field.

## Core identity fields (high level)

These sit on the listing itself, outside the nested groups:

- Stable listing id
- Human-readable title
- Property type (fixed set: `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, `land`)
- Status (from the lifecycle list above)
- Short description for investors
- Created/updated timestamps (as business concepts; format decided later)

Property type uses the same closed-list rule as status: only the values above. Spellings such as `multi_family`, `house`, or `commercial` are not in this set.

## Success criteria — “a valid investor listing”

A listing is valid when later types and fixtures can prove every item below. If a type allows a status or field not listed in this brief, the type is wrong.

1. Has a non-empty id and title.
2. Status is exactly one of the allowed lifecycle values (no free-text variants).
3. Property type is exactly one of the allowed property-type values.
4. Address includes enough fields to locate the property (street, city, region/state, postal code, country).
5. Financial summary includes a numeric asking price and a currency code.
6. At least one investor contact with a name and a reachable channel (email or phone).
7. Ownership relationship for each contact is from an agreed fixed set (not free text).
8. Optional fields may be absent; required fields above must never be missing for `published`, `under_offer`, or `sold`.

**Drafts** may still be incomplete while the listing editor works. **Reviewer / compliance** does not publish until items 1–7 hold. Investors only browse listings that already meet that bar.

The production bugs this bar exists to stop:

- A missing asking price on a `published` / `under_offer` / `sold` listing
- Status spelled three ways instead of the five allowed values
- A nested address (or contact) field that is present on one screen and gone on another

## Out of scope for this topic

- Building UI forms, API routes, or database tables.
- Authentication, payments, or document uploads.
- Exact TypeScript syntax (comes in later steps).

Do not paste private investor data or production credentials into prompts or into this file. Examples used in later fixtures must be fictional.

## Handoff note

Later steps must implement types that honor this brief and the companion field inventory. If a type allows a status or field not listed here, the type is wrong.
