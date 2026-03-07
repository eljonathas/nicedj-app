import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AtSign, MessageSquareText, Send, Trash2 } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { useAuthStore } from '../../stores/authStore'
import { useRoomStore } from '../../stores/roomStore'
import {
  compareUserPresencePriority,
  getPlatformRoleMeta,
  getRoomRoleMeta,
  normalizePlatformRole,
  roomRoleHasPermission,
} from '../../lib/roles'
import {
  applyMentionDraft,
  buildMentionCandidates,
  getActiveMentionDraft,
  parseChatMentions,
} from '../../lib/chatMentions'
import { Avatar } from '../ui/Avatar'

type GroupedChatItem =
  | {
      type: 'system'
      id: string
      content: string
    }
  | {
      type: 'user'
      id: string
      userId: string
      username: string
      avatar?: string | null
      role?: string | null
      platformRole?: string | null
      timestamp: string
      messages: Array<{
        id: string
        content: string
        mentionMeta: ReturnType<typeof parseChatMentions>
      }>
    }

export function ChatPanel() {
  const chatRoomId = useChatStore((s) => s.roomId)
  const messages = useChatStore((s) => s.messages)
  const setMessages = useChatStore((s) => s.setMessages)
  const clearMessages = useChatStore((s) => s.clearMessages)
  const wsClient = useAuthStore((s) => s.wsClient)
  const user = useAuthStore((s) => s.user)
  const room = useRoomStore((s) => s.room)
  const users = useRoomStore((s) => s.users)
  const [input, setInput] = useState('')
  const [caretPosition, setCaretPosition] = useState<number | null>(null)
  const [activeMentionIndex, setActiveMentionIndex] = useState(0)
  const [showMentionedOnly, setShowMentionedOnly] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const currentRoomRole = useMemo(
    () => users.find((candidate) => candidate.id === user?.id)?.role ?? 'user',
    [user?.id, users],
  )
  const mentionIndex = useMemo(
    () =>
      buildMentionCandidates(
        users.map((candidate) => ({
          id: candidate.id,
          username: candidate.username,
        })),
      ),
    [users],
  )
  const mentionableUsers = useMemo(() => {
    const seen = new Set<string>()

    return [...users].sort(compareUserPresencePriority).filter((candidate) => {
      const normalizedUsername = candidate.username.trim().toLocaleLowerCase()
      if (!normalizedUsername || seen.has(normalizedUsername)) {
        return false
      }

      seen.add(normalizedUsername)
      return true
    })
  }, [users])
  const parsedMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        mentionMeta: message.system
          ? null
          : parseChatMentions(message.content, mentionIndex, user?.id),
      })),
    [mentionIndex, messages, user?.id],
  )
  const mentionMatchCount = useMemo(
    () =>
      parsedMessages.filter(
        (message) =>
          !message.system && Boolean(message.mentionMeta?.mentionsCurrentUser),
      ).length,
    [parsedMessages],
  )
  const mentionDraft = useMemo(
    () => getActiveMentionDraft(input, caretPosition),
    [caretPosition, input],
  )
  const mentionSuggestions = useMemo(() => {
    if (!mentionDraft) {
      return []
    }

    const normalizedQuery = mentionDraft.query.trim().toLocaleLowerCase()
    return mentionableUsers
      .filter((candidate) => {
        if (!normalizedQuery) {
          return true
        }

        return candidate.username.toLocaleLowerCase().includes(normalizedQuery)
      })
      .slice(0, 6)
  }, [mentionDraft, mentionableUsers])
  const groupedItems = useMemo<GroupedChatItem[]>(() => {
    const nextItems: GroupedChatItem[] = []

    for (const message of parsedMessages) {
      if (message.system) {
        nextItems.push({
          type: 'system',
          id: message.id,
          content: message.content,
        })
        continue
      }

      const lastItem = nextItems.at(-1)
      const isSameUserGroup =
        lastItem?.type === 'user' &&
        lastItem.userId === message.userId &&
        !message.system

      if (isSameUserGroup) {
        lastItem.messages.push({
          id: message.id,
          content: message.content,
          mentionMeta: message.mentionMeta,
        })
        continue
      }

      nextItems.push({
        type: 'user',
        id: message.id,
        userId: message.userId,
        username: message.username,
        avatar: message.avatar,
        role: message.role,
        platformRole: message.platformRole,
        timestamp: message.timestamp,
        messages: [
          {
            id: message.id,
            content: message.content,
            mentionMeta: message.mentionMeta,
          },
        ],
      })
    }

    return nextItems
  }, [parsedMessages])
  const visibleItems = useMemo(
    () =>
      groupedItems.filter((item) => {
        if (!showMentionedOnly) {
          return true
        }

        return (
          item.type === 'user' &&
          item.messages.some((message) => message.mentionMeta.mentionsCurrentUser)
        )
      }),
    [groupedItems, showMentionedOnly],
  )
  const isMentionMenuOpen = Boolean(
    mentionDraft && mentionSuggestions.length > 0,
  )

  useEffect(() => {
    setActiveMentionIndex(0)
  }, [mentionDraft?.query, mentionDraft?.start, mentionSuggestions.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [visibleItems.length])

  useEffect(() => {
    if (!room?.id) {
      clearMessages()
      return
    }

    if (chatRoomId !== room.id) {
      setMessages(room.id, [])
    }
  }, [chatRoomId, clearMessages, room?.id, setMessages])

  const handleSend = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    wsClient?.send('send_chat', { content: trimmed })
    setInput('')
    setCaretPosition(0)
  }

  const handleClearChat = () => {
    if (!roomRoleHasPermission(currentRoomRole, 'clear_chat')) return
    if (!window.confirm('Limpar o chat da sala?')) return

    wsClient?.send('clear_chat')
  }

  const insertMention = (username: string) => {
    if (!mentionDraft) {
      return
    }

    const nextState = applyMentionDraft(input, mentionDraft, username)
    setInput(nextState.content)
    setCaretPosition(nextState.nextCaretPosition)

    window.requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(
        nextState.nextCaretPosition,
        nextState.nextCaretPosition,
      )
    })
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isMentionMenuOpen) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveMentionIndex(
        (current) => (current + 1) % mentionSuggestions.length,
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveMentionIndex((current) =>
        current === 0 ? mentionSuggestions.length - 1 : current - 1,
      )
      return
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      const nextIndex = Math.min(
        activeMentionIndex,
        mentionSuggestions.length - 1,
      )
      insertMention(mentionSuggestions[nextIndex].username)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setCaretPosition(null)
    }
  }

  return (
    <div className="flex h-full flex-col bg-[rgba(10,13,19,0.92)]">
      <div className="flex items-center justify-between gap-2 border-b border-[rgba(255,255,255,0.06)] px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          CHAT ({messages.length})
        </p>

        <div className="flex items-center gap-1.5">
          <div className="inline-flex items-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.92)] p-1">
            <button
              type="button"
              onClick={() => setShowMentionedOnly(false)}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                !showMentionedOnly
                  ? 'bg-[rgba(255,255,255,0.08)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setShowMentionedOnly(true)}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                showMentionedOnly
                  ? 'bg-[rgba(255,196,102,0.18)] text-[#ffd289]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <AtSign className="h-3 w-3" />
              Menções
              <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] px-1 text-[9px] text-[var(--text-secondary)]">
                {mentionMatchCount}
              </span>
            </button>
          </div>

          {roomRoleHasPermission(currentRoomRole, 'clear_chat') && (
            <button
              type="button"
              onClick={handleClearChat}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(16,20,28,0.92)] text-[var(--text-muted)] transition-colors hover:border-[rgba(176,107,255,0.26)] hover:text-[#d8c1ff]"
              aria-label="Limpar chat"
              title="Limpar chat"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-1.5">
        {messages.length === 0 && (
          <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center px-4">
            <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(29,185,84,0.14)] text-[var(--accent-hover)]">
              <MessageSquareText className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              Sem mensagens ainda
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
              Comece a conversa com a sala.
            </p>
          </div>
        )}

        {messages.length > 0 && visibleItems.length === 0 && (
          <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center px-4">
            <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(255,196,102,0.14)] text-[#ffd289]">
              <AtSign className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              Nenhuma menção encontrada
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
              Quando alguém mencionar você, as mensagens aparecerão aqui.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {visibleItems.map((item) => {
            if (item.type === 'system') {
              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="flex justify-center py-1"
                >
                  <div className="max-w-[92%] rounded-full border border-[rgba(176,107,255,0.18)] bg-[rgba(48,28,73,0.34)] px-3 py-1.5 text-center text-[11px] font-medium text-[#dcc5ff]">
                    {item.content}
                  </div>
                </motion.article>
              )
            }

            const roomRole = getRoomRoleMeta(item.role)
            const platformRole = getPlatformRoleMeta(item.platformRole)
            const RoomRoleIcon = roomRole.icon
            const PlatformRoleIcon = platformRole.icon
            const groupMentionsCurrentUser = item.messages.some((message) =>
              message.mentionMeta.mentionsCurrentUser,
            )

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className={`flex items-start gap-2 rounded-[1rem] px-2 py-2 ${
                  groupMentionsCurrentUser
                    ? 'bg-[rgba(255,176,82,0.08)] shadow-[0_10px_20px_rgba(255,176,82,0.04)]'
                    : ''
                }`}
              >
                <Avatar
                  username={item.username}
                  src={item.avatar}
                  size="sm"
                  className="mt-0.5 h-6 w-6 text-[10px]"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1">
                      <RoomRoleIcon
                        className={`h-3 w-3 shrink-0 ${roomRole.iconClassName}`}
                      />
                      {normalizePlatformRole(item.platformRole) !== 'none' && (
                        <PlatformRoleIcon
                          className={`h-3 w-3 shrink-0 ${platformRole.iconClassName}`}
                        />
                      )}
                    </span>
                    <span
                      className={`truncate text-[11px] font-semibold ${roomRole.nameClassName}`}
                    >
                      {item.username}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="mt-1 space-y-0.5">
                    {item.messages.map((message) => (
                      <p
                        key={message.id}
                        className="break-words text-[12px] leading-[1.5] text-[var(--text-secondary)]"
                      >
                        {message.mentionMeta.segments.map(
                          (segment, segmentIndex) => {
                            if (segment.type === 'text') {
                              return (
                                <span key={`${message.id}-text-${segmentIndex}`}>
                                  {segment.text}
                                </span>
                              )
                            }

                            return (
                              <span
                                key={`${message.id}-mention-${segmentIndex}`}
                                className={`mx-[1px] inline-flex items-center rounded-full px-1.5 py-[1px] align-[0.02em] font-semibold ${
                                  segment.isCurrentUser
                                    ? 'bg-[rgba(255,176,82,0.2)] text-[#ffd289]'
                                    : 'bg-[rgba(94,185,255,0.18)] text-[#a7dbff]'
                                }`}
                              >
                                {segment.text}
                              </span>
                            )
                          },
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.article>
            )
          })}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[rgba(255,255,255,0.08)] px-2.5 py-2">
        <form onSubmit={handleSend} className="flex items-end gap-1.5">
          <div className="relative flex-1">
            {isMentionMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
                className="absolute inset-x-0 bottom-[calc(100%+0.5rem)] z-10 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(11,16,24,0.98)] shadow-[0_18px_42px_rgba(0,0,0,0.32)]"
              >
                <div className="border-b border-[rgba(255,255,255,0.06)] px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Mencionar usuário
                  </p>
                </div>

                <div className="max-h-56 overflow-y-auto p-1.5">
                  {mentionSuggestions.map((candidate, index) => {
                    const roomRole = getRoomRoleMeta(candidate.role)
                    const platformRole = getPlatformRoleMeta(
                      candidate.platformRole,
                    )
                    const PlatformIcon = platformRole.icon
                    const isActive = index === activeMentionIndex

                    return (
                      <button
                        key={candidate.id}
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault()
                          insertMention(candidate.username)
                        }}
                        className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors ${
                          isActive
                            ? 'bg-[rgba(255,255,255,0.08)]'
                            : 'hover:bg-[rgba(255,255,255,0.04)]'
                        }`}
                      >
                        <Avatar
                          username={candidate.username}
                          src={candidate.avatar}
                          size="sm"
                          className="h-7 w-7"
                        />

                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-[12px] font-semibold ${roomRole.nameClassName}`}
                          >
                            {candidate.username}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                            <span className="truncate">{roomRole.label}</span>
                            {normalizePlatformRole(candidate.platformRole) !==
                              'none' && (
                              <span className="inline-flex items-center gap-1 truncate">
                                <PlatformIcon
                                  className={`h-3 w-3 ${platformRole.iconClassName}`}
                                />
                                {platformRole.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => {
                setInput(event.target.value)
                setCaretPosition(event.target.selectionStart)
              }}
              onClick={(event) =>
                setCaretPosition(event.currentTarget.selectionStart)
              }
              onKeyDown={handleInputKeyDown}
              onKeyUp={(event) =>
                setCaretPosition(event.currentTarget.selectionStart)
              }
              onSelect={(event) =>
                setCaretPosition(event.currentTarget.selectionStart)
              }
              placeholder="Mensagem... use @ para mencionar"
              maxLength={255}
              className="h-9 w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(16,20,28,0.95)] px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[rgba(255,255,255,0.24)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            className="h-9 w-9 rounded-lg border border-[rgba(255,255,255,0.14)] bg-[rgba(31,36,47,0.95)] text-[var(--text-secondary)] transition-all hover:bg-[rgba(40,46,60,1)] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Enviar mensagem"
          >
            <Send className="mx-auto h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
