export type MentionUserCandidate = {
  id: string
  username: string
}

export type BuiltMentionCandidate = MentionUserCandidate & {
  normalizedUsername: string
}

export type MentionSegment =
  | {
      type: 'text'
      text: string
    }
  | {
      type: 'mention'
      text: string
      userId: string
      username: string
      isCurrentUser: boolean
    }

export type ParsedChatMentions = {
  segments: MentionSegment[]
  mentionedUserIds: string[]
  hasMentions: boolean
  mentionsCurrentUser: boolean
}

export type ActiveMentionDraft = {
  query: string
  start: number
  end: number
}

const ACTIVE_MENTION_REGEX = /(?:^|[\s([{"'])@([^\s@]{0,32})$/
const MENTION_START_BOUNDARY = /[\s([{"'`]/
const MENTION_END_BOUNDARY = /[\s).,!?;:\]}>"'`]/

export function buildMentionCandidates(
  users: MentionUserCandidate[],
): BuiltMentionCandidate[] {
  const uniqueUsers = new Map<string, BuiltMentionCandidate>()

  for (const user of users) {
    const username = user.username.trim()
    if (!username) {
      continue
    }

    const normalizedUsername = username.toLocaleLowerCase()
    if (uniqueUsers.has(normalizedUsername)) {
      continue
    }

    uniqueUsers.set(normalizedUsername, {
      id: user.id,
      username,
      normalizedUsername,
    })
  }

  return [...uniqueUsers.values()].sort((left, right) => {
    const lengthDelta = right.username.length - left.username.length
    if (lengthDelta !== 0) {
      return lengthDelta
    }

    return left.username.localeCompare(right.username, undefined, {
      sensitivity: 'base',
    })
  })
}

export function parseChatMentions(
  content: string,
  candidates: BuiltMentionCandidate[],
  currentUserId?: string | null,
): ParsedChatMentions {
  const segments: MentionSegment[] = []
  const mentionedUserIds = new Set<string>()
  let buffer = ''
  let mentionsCurrentUser = false
  let cursor = 0

  const flushBuffer = () => {
    if (!buffer) {
      return
    }

    segments.push({ type: 'text', text: buffer })
    buffer = ''
  }

  while (cursor < content.length) {
    const currentChar = content[cursor]

    if (currentChar !== '@' || !isMentionStart(content, cursor)) {
      buffer += currentChar
      cursor += 1
      continue
    }

    const match = candidates.find((candidate) => {
      const endIndex = cursor + 1 + candidate.username.length
      const slice = content.slice(cursor + 1, endIndex)
      if (slice.toLocaleLowerCase() !== candidate.normalizedUsername) {
        return false
      }

      return isMentionEndBoundary(content[endIndex])
    })

    if (!match) {
      buffer += currentChar
      cursor += 1
      continue
    }

    flushBuffer()

    const endIndex = cursor + 1 + match.username.length
    const mentionText = content.slice(cursor, endIndex)
    const isCurrentUser = Boolean(currentUserId && currentUserId === match.id)

    mentionedUserIds.add(match.id)
    mentionsCurrentUser ||= isCurrentUser
    segments.push({
      type: 'mention',
      text: mentionText,
      userId: match.id,
      username: match.username,
      isCurrentUser,
    })

    cursor = endIndex
  }

  flushBuffer()

  return {
    segments,
    mentionedUserIds: [...mentionedUserIds],
    hasMentions: mentionedUserIds.size > 0,
    mentionsCurrentUser,
  }
}

export function getActiveMentionDraft(
  content: string,
  caretPosition: number | null | undefined,
): ActiveMentionDraft | null {
  const safeCaretPosition = Math.max(0, Math.min(content.length, caretPosition ?? content.length))
  const prefix = content.slice(0, safeCaretPosition)
  const match = ACTIVE_MENTION_REGEX.exec(prefix)

  if (!match) {
    return null
  }

  const query = match[1]
  return {
    query,
    start: safeCaretPosition - query.length - 1,
    end: safeCaretPosition,
  }
}

export function applyMentionDraft(
  content: string,
  draft: ActiveMentionDraft,
  username: string,
): {
  content: string
  nextCaretPosition: number
} {
  const prefix = content.slice(0, draft.start)
  const suffix = content.slice(draft.end)
  const shouldAppendSpace = suffix.length === 0 || !/^[\s),.!?;:]/.test(suffix)
  const insertedMention = `@${username}${shouldAppendSpace ? ' ' : ''}`
  const nextContent = `${prefix}${insertedMention}${suffix}`

  return {
    content: nextContent,
    nextCaretPosition: prefix.length + insertedMention.length,
  }
}

function isMentionStart(content: string, index: number) {
  if (content[index] !== '@') {
    return false
  }

  if (index === 0) {
    return true
  }

  return MENTION_START_BOUNDARY.test(content[index - 1] ?? '')
}

function isMentionEndBoundary(value: string | undefined) {
  if (!value) {
    return true
  }

  return MENTION_END_BOUNDARY.test(value)
}
