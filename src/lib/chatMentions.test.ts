import { describe, expect, it } from 'vitest'
import {
  applyMentionDraft,
  buildMentionCandidates,
  getActiveMentionDraft,
  parseChatMentions,
} from './chatMentions'

describe('chatMentions', () => {
  const candidates = buildMentionCandidates([
    { id: 'user-1', username: 'TheMars' },
    { id: 'user-2', username: 'DJ Nova' },
    { id: 'user-3', username: 'Theo' },
  ])

  it('parses mentions using the connected room users and flags mentions to the viewer', () => {
    const parsed = parseChatMentions(
      'fala @TheMars e chama @DJ Nova pro booth',
      candidates,
      'user-1',
    )

    expect(parsed.hasMentions).toBe(true)
    expect(parsed.mentionsCurrentUser).toBe(true)
    expect(parsed.mentionedUserIds).toEqual(['user-1', 'user-2'])
    expect(parsed.segments.filter((segment) => segment.type === 'mention')).toHaveLength(2)
  })

  it('ignores emails and partial matches that are not valid mentions', () => {
    const parsed = parseChatMentions(
      'manda no the@mars.com e nao pinga @Theo-123',
      candidates,
      'user-3',
    )

    expect(parsed.hasMentions).toBe(false)
    expect(parsed.mentionsCurrentUser).toBe(false)
    expect(parsed.mentionedUserIds).toEqual([])
  })

  it('extracts the active draft and applies the selected mention with a safe suffix', () => {
    const draft = getActiveMentionDraft('chama @th', 9)

    expect(draft).toEqual({
      query: 'th',
      start: 6,
      end: 9,
    })

    expect(applyMentionDraft('chama @th agora', draft!, 'TheMars')).toEqual({
      content: 'chama @TheMars agora',
      nextCaretPosition: 14,
    })
  })
})
