/**
 * Seed public.properties from data/sample-properties.json with real embeddings.
 *
 * Flow (beginner-simple):
 *   1) Load the JSON file
 *   2) Loop each property
 *   3) Call generatePropertyEmbedding (do not reimplement HTTP here)
 *   4) Insert one row (JSON fields → table columns)
 *   5) Log progress
 *
 * Run from the repo root:
 *   npx tsx --env-file=.env scripts/seed-property-embeddings.ts
 *
 * Required env (names only — values stay in local .env):
 *   EMBEDDING_API_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_URL (or VITE_SUPABASE_URL)
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createClient } from '@supabase/supabase-js'

import { generatePropertyEmbedding } from '../src/lib/embeddings/generate.ts'

/** One listing in data/sample-properties.json (matches migration columns). */
type SampleProperty = {
  id: string
  title: string
  description: string
  city: string
  state: string
  price: number
}

type SampleFile = {
  properties: SampleProperty[]
}

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in .env, then re-run with --env-file=.env.`,
    )
  }
  return value
}

async function main() {
  const supabaseUrl = requireEnv(
    'SUPABASE_URL',
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
  )
  const serviceRoleKey = requireEnv(
    'SUPABASE_SERVICE_ROLE_KEY',
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
  // generatePropertyEmbedding reads EMBEDDING_API_KEY itself; fail fast here too.
  requireEnv('EMBEDDING_API_KEY', process.env.EMBEDDING_API_KEY)

  const jsonPath = resolve(process.cwd(), 'data/sample-properties.json')
  const file = JSON.parse(readFileSync(jsonPath, 'utf8')) as SampleFile
  const properties = file.properties

  if (!Array.isArray(properties) || properties.length === 0) {
    throw new Error(`No properties found in ${jsonPath}`)
  }

  // Service-role client: seed script only (bypasses RLS). Never use in the browser.
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  console.log(`Seeding ${properties.length} properties from ${jsonPath}`)

  let okCount = 0
  let failCount = 0

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i]
    if (!property) continue

    const label = `[${i + 1}/${properties.length}] ${property.title}`
    console.log(`\n${label}`)
    console.log(`  id: ${property.id}`)

    const result = await generatePropertyEmbedding({
      title: property.title,
      description: property.description,
    })

    if (!result.ok) {
      failCount += 1
      console.error(`  embedding failed (${result.code}): ${result.message}`)
      continue
    }

    console.log(
      `  embedding ok (${result.dimensions} dims, model=${result.model})`,
    )

    // Map JSON fields to public.properties columns exactly (plus embedding).
    const { error } = await supabase.from('properties').insert({
      id: property.id,
      title: property.title,
      description: property.description,
      city: property.city,
      state: property.state,
      price: property.price,
      embedding: result.embedding,
    })

    if (error) {
      failCount += 1
      console.error(`  insert failed: ${error.message}`)
      continue
    }

    okCount += 1
    console.log('  inserted')
  }

  console.log(`\nDone. inserted=${okCount} failed=${failCount}`)
  if (failCount > 0) {
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exitCode = 1
})
