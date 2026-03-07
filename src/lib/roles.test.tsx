import { describe, expect, it } from 'vitest'
import {
  compareUserPresencePriority,
  getUserPresenceGroup,
  getUserPresenceGroupMeta,
} from './roles'

describe('roles presence hierarchy', () => {
  it('elevates developer and ambassador flags above room hierarchy', () => {
    const users = [
      { username: 'HostUser', role: 'host', platformRole: 'none' },
      { username: 'DevUser', role: 'user', platformRole: 'developer' },
      { username: 'AmbUser', role: 'manager', platformRole: 'ambassador' },
      { username: 'CohostUser', role: 'cohost', platformRole: 'none' },
    ]

    expect([...users].sort(compareUserPresencePriority).map((user) => user.username)).toEqual([
      'DevUser',
      'AmbUser',
      'HostUser',
      'CohostUser',
    ])
  })

  it('maps special flags to their own titled sections', () => {
    expect(getUserPresenceGroup('developer', 'host')).toBe('developer')
    expect(getUserPresenceGroup('ambassador', 'manager')).toBe('ambassador')
    expect(getUserPresenceGroup('none', 'cohost')).toBe('cohost')
    expect(getUserPresenceGroupMeta('developer').title).toBe('Developers')
    expect(getUserPresenceGroupMeta('ambassador').title).toBe('Embaixadores')
  })
})
