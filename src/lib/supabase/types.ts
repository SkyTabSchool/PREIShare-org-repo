// Shared Database shape aligned with docs/data-model/property-listings-schema.md
// Table: public.property_listings
//
// id           uuid          not null  default gen_random_uuid()
// owner_id     uuid          not null  FK → auth.users(id) ON DELETE CASCADE
// title        text          not null
// description  text          null
// address_line1 text         not null
// city         text          not null
// region       text          null
// postal_code  text          null
// country      text          not null  default 'US'
// price        numeric(12,2) not null  check price >= 0
// status       text          not null  default 'draft'
//                            check status in ('draft', 'published', 'archived')
// created_at   timestamptz   not null  default now()
// updated_at   timestamptz   not null  default now()

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/** Postgres check constraint on property_listings.status. Text, not a DB enum. */
export type PropertyListingStatus = 'draft' | 'published' | 'archived'

export type Database = {
  public: {
    Tables: {
      property_listings: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          address_line1: string
          city: string
          region: string | null
          postal_code: string | null
          country: string
          price: number
          status: PropertyListingStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          address_line1: string
          city: string
          region?: string | null
          postal_code?: string | null
          country?: string
          price: number
          status?: PropertyListingStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          address_line1?: string
          city?: string
          region?: string | null
          postal_code?: string | null
          country?: string
          price?: number
          status?: PropertyListingStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
