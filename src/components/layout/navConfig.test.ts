import { describe, expect, it } from 'vitest'
import { getPageTitle } from './navConfig'

describe('getPageTitle', () => {
  it('returns the title for an exact dashboard path', () => {
    expect(getPageTitle('/dashboard/portfolio')).toBe('Your portfolio')
  })

  it('returns the nested section title for a child path', () => {
    expect(getPageTitle('/dashboard/deals/123')).toBe('Open deals')
  })

  it('falls back when the path is not a dashboard section', () => {
    expect(getPageTitle('/unknown')).toBe('Dashboard')
  })
})
