import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  Check,
  ChevronsUp,
  Disc3,
  GripVertical,
  Link2,
  ListMusic,
  Loader2,
  Settings2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { usePlaylistStore } from '../stores/playlistStore'

export const Route = createFileRoute('/playlists')({
  component: PlaylistsPage,
})

function looksLikeMediaUrl(value: string) {
  return /^(https?:\/\/)?(?:www\.)?(?:(?:music|m)\.)?(?:youtube\.com|youtu\.be)\//i.test(
    value.trim(),
  )
}

export function PlaylistsPage() {
  type SearchResult = {
    sourceId: string
    source: 'youtube' | 'soundcloud'
    title: string
    artist: string
    thumbnailUrl: string | null
  }

  const user = useAuthStore((s) => s.user)
  const {
    playlists,
    tracks,
    activePlaylistId,
    loading,
    fetchPlaylists,
    fetchTracks,
    createPlaylist,
    deletePlaylist,
    activatePlaylist,
    grabUsesActivePlaylistByDefault,
    setGrabUsesActivePlaylistByDefault,
    addTrack,
    addTrackFromUrl,
    removeTrack,
    reorderTracks,
  } = usePlaylistStore()
  const [newName, setNewName] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mediaInput, setMediaInput] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [mediaNotice, setMediaNotice] = useState<string | null>(null)
  const [addingSearchResultId, setAddingSearchResultId] = useState<
    string | null
  >(null)
  const [submittingMedia, setSubmittingMedia] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [draggedTrackId, setDraggedTrackId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{
    trackId: string
    placement: 'before' | 'after'
  } | null>(null)
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false)
  const settingsMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (user) {
      void fetchPlaylists()
    }
  }, [fetchPlaylists, user])

  useEffect(() => {
    if (selectedId) {
      void fetchTracks(selectedId)
    }
  }, [fetchTracks, selectedId])

  useEffect(() => {
    if (playlists.length === 0) {
      setSelectedId(null)
      return
    }

    const selectedStillExists = selectedId
      ? playlists.some((playlist) => playlist.id === selectedId)
      : false
    if (!selectedStillExists) {
      setSelectedId(activePlaylistId ?? playlists[0].id)
    }
  }, [activePlaylistId, playlists, selectedId])

  useEffect(() => {
    if (!isSettingsMenuOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target as Node)
      ) {
        setIsSettingsMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isSettingsMenuOpen])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const playlistId = await createPlaylist(newName.trim())
    setSelectedId(playlistId)
    setNewName('')
  }

  const handleAddSearchResult = async (result: SearchResult) => {
    if (!selectedId) {
      setMediaError('Selecione uma playlist antes de adicionar faixas.')
      return
    }

    setMediaError(null)
    setMediaNotice(null)
    setAddingSearchResultId(result.sourceId)

    try {
      await addTrack(selectedId, {
        sourceId: result.sourceId,
        source: result.source,
      })
      setMediaNotice('Faixa adicionada à playlist.')
    } catch (error: any) {
      setMediaError(error.message || 'Não foi possível adicionar a faixa.')
    } finally {
      setAddingSearchResultId(null)
    }
  }

  const handleMediaSubmit = async () => {
    const value = mediaInput.trim()

    if (!value) return
    if (!selectedId) {
      setMediaError('Selecione ou crie uma playlist antes de adicionar faixas.')
      return
    }

    setMediaError(null)
    setMediaNotice(null)

    if (looksLikeMediaUrl(value)) {
      setSubmittingMedia(true)

      try {
        await addTrackFromUrl(selectedId, value)
        setMediaInput('')
        setSearchResults([])
        setMediaNotice('Link adicionado à playlist.')
      } catch (error: any) {
        setMediaError(error.message || 'Não foi possível adicionar o link.')
      } finally {
        setSubmittingMedia(false)
      }

      return
    }

    setSearchLoading(true)

    try {
      const params = new URLSearchParams({
        q: value,
        source: 'youtube',
        limit: '8',
      })

      const data = await api<SearchResult[]>(
        `/api/media/search?${params.toString()}`,
      )
      setSearchResults(data)
    } catch (error: any) {
      setSearchResults([])
      setMediaError(error.message || 'Não foi possível buscar vídeos.')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleDeletePlaylist = async (playlistId: string) => {
    setIsSettingsMenuOpen(false)
    await deletePlaylist(playlistId)
    setMediaInput('')
    setMediaError(null)
    setSearchResults([])
  }

  const commitTrackOrder = async (nextTrackIds: string[]) => {
    if (!selectedId || reordering) return

    const currentTrackIds = tracks.map((track) => track.id)
    const hasChanged = nextTrackIds.some(
      (trackId, index) => trackId !== currentTrackIds[index],
    )

    if (!hasChanged) return

    setReordering(true)
    try {
      await reorderTracks(selectedId, nextTrackIds)
    } finally {
      setReordering(false)
    }
  }

  const handleMoveTrackToFirst = async (trackId: string) => {
    if (!selectedId || reordering || tracks[0]?.id === trackId) return

    const nextTrackIds = [
      trackId,
      ...tracks
        .filter((track) => track.id !== trackId)
        .map((track) => track.id),
    ]

    await commitTrackOrder(nextTrackIds)
  }

  const handleTrackDragStart = (
    event: DragEvent<HTMLDivElement>,
    trackId: string,
  ) => {
    if (reordering) return

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', trackId)
    setDraggedTrackId(trackId)
    setDropTarget(null)
  }

  const handleTrackDragEnd = () => {
    setDraggedTrackId(null)
    setDropTarget(null)
  }

  const handleTrackDragOver = (
    event: DragEvent<HTMLDivElement>,
    trackId: string,
  ) => {
    if (!draggedTrackId || draggedTrackId === trackId || reordering) return

    event.preventDefault()

    const bounds = event.currentTarget.getBoundingClientRect()
    const offsetY = event.clientY - bounds.top
    const placement = offsetY < bounds.height / 2 ? 'before' : 'after'

    setDropTarget((current) => {
      if (current?.trackId === trackId && current.placement === placement) {
        return current
      }

      return {
        trackId,
        placement,
      }
    })
  }

  const handleTrackDrop = async (
    event: DragEvent<HTMLDivElement>,
    targetTrackId: string,
  ) => {
    event.preventDefault()

    if (!selectedId || !draggedTrackId || reordering) {
      handleTrackDragEnd()
      return
    }

    const placement =
      dropTarget?.trackId === targetTrackId ? dropTarget.placement : 'before'
    const nextTrackIds = reorderTrackIds(
      tracks.map((track) => track.id),
      draggedTrackId,
      targetTrackId,
      placement,
    )

    await commitTrackOrder(nextTrackIds)
    handleTrackDragEnd()
  }

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--text-secondary)]">
          Faça login para gerenciar suas playlists.
        </p>
      </div>
    )
  }

  const selected = playlists.find((playlist) => playlist.id === selectedId)
  const mediaInputTrimmed = mediaInput.trim()
  const mediaInputIsUrl = looksLikeMediaUrl(mediaInputTrimmed)
  const mediaBusy = searchLoading || submittingMedia
  const trackSourceKeys = useMemo(
    () => new Set(tracks.map((track) => `${track.source}:${track.sourceId}`)),
    [tracks],
  )

  return (
    <div className="flex min-h-full flex-1 flex-col overflow-hidden md:flex-row">
      <div className="flex w-full shrink-0 flex-col border-r border-[var(--border-light)] bg-[var(--bg-secondary)] md:w-72">
        <div className="border-b border-[var(--border-light)] p-4">
          <div
            ref={settingsMenuRef}
            className="relative mb-3 flex items-center justify-between gap-3"
          >
            <h2 className="text-lg font-bold text-white">Minhas Playlists</h2>

            <button
              type="button"
              aria-label="Configurações globais de playlists"
              aria-haspopup="menu"
              aria-expanded={isSettingsMenuOpen}
              onClick={() => setIsSettingsMenuOpen((current) => !current)}
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                isSettingsMenuOpen
                  ? 'border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] text-white'
                  : 'border-[var(--border-light)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <Settings2 className="h-4 w-4" />
            </button>

            {isSettingsMenuOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                role="menu"
                className="absolute top-full left-0 right-0 z-20 mt-2 overflow-hidden rounded-[1.35rem] border border-[var(--border-light)] bg-[rgba(10,14,21,0.96)] shadow-[0_22px_42px_rgba(0,0,0,0.36)] backdrop-blur-xl md:top-0 md:left-full md:right-auto md:mt-0 md:ml-3 md:w-[20rem]"
              >
                <div className="border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Configurações
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-4">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-white">
                      Usar playlist ativa como destino padrão do Grab
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={grabUsesActivePlaylistByDefault}
                    onClick={() =>
                      setGrabUsesActivePlaylistByDefault(
                        !grabUsesActivePlaylistByDefault,
                      )
                    }
                    className={`inline-flex h-8 w-14 shrink-0 items-center rounded-full border px-1 transition-colors ${
                      grabUsesActivePlaylistByDefault
                        ? 'border-[rgba(55,210,124,0.26)] bg-[rgba(11,29,19,0.82)]'
                        : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)]'
                    }`}
                  >
                    <span
                      className={`h-6 w-6 rounded-full bg-white shadow-[0_10px_20px_rgba(0,0,0,0.22)] transition-transform ${
                        grabUsesActivePlaylistByDefault
                          ? 'translate-x-5'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Nova playlist..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleCreate()}
              className="w-full text-[13px]"
            />
            <Button
              size="sm"
              onClick={() => void handleCreate()}
              disabled={!newName.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
            </div>
          )}

          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => setSelectedId(playlist.id)}
              className={`flex w-full items-center gap-3 border-0 px-4 py-3 text-left transition-colors ${
                selectedId === playlist.id
                  ? 'bg-[var(--bg-hover)] text-white'
                  : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <ListMusic className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate text-[14px] font-medium">
                {playlist.name}
              </span>
              {playlist.isActive && (
                <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
              )}
            </button>
          ))}

          {!loading && playlists.length === 0 && (
            <p className="px-4 py-8 text-center text-[13px] text-[var(--text-muted)]">
              Nenhuma playlist criada.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {selected ? (
          <>
            <div className="sticky top-0 z-10 border-b border-[var(--border-light)] bg-[var(--bg-primary)]/92 p-4 backdrop-blur-xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {selected.name}
                  </h1>
                  <p className="text-[13px] text-[var(--text-secondary)]">
                    {tracks.length} {tracks.length === 1 ? 'música' : 'músicas'}
                    {selected.isActive && ' · Ativa na sala'}
                  </p>
                </div>

                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                  {!selected.isActive && (
                    <Button
                      size="sm"
                      onClick={() => void activatePlaylist(selected.id)}
                    >
                      Ativar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => void handleDeletePlaylist(selected.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex w-full flex-col gap-4 lg:flex-row lg:items-end items-start">
                <div className="min-w-0 flex-1">
                  <Input
                    label="BUSCAR NO YOUTUBE"
                    placeholder="Pesquise uma música, artista ou cole um link do YouTube"
                    value={mediaInput}
                    onChange={(e) => {
                      const value = e.target.value
                      setMediaInput(value)
                      setMediaError(null)
                      setMediaNotice(null)

                      if (!value.trim() || looksLikeMediaUrl(value)) {
                        setSearchResults([])
                      }
                    }}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && void handleMediaSubmit()
                    }
                    error={mediaError ?? undefined}
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={() => void handleMediaSubmit()}
                  isLoading={mediaBusy}
                  disabled={!mediaInputTrimmed}
                  className="shrink-0"
                >
                  {mediaInputIsUrl ? (
                    <Link2 className="h-4 w-4" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {mediaInputIsUrl ? 'Adicionar link' : 'Buscar'}
                </Button>
              </div>

              {mediaNotice && !mediaError && (
                <div className="mt-3 rounded-xl border border-[rgba(55,210,124,0.22)] bg-[rgba(11,29,19,0.72)] px-4 py-2 text-[12px] font-medium text-[var(--accent-hover)]">
                  {mediaNotice}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4 p-4">
                {searchLoading && (
                  <div className="flex items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,18,0.7)] px-4 py-3 text-[13px] text-[var(--text-secondary)]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando vídeos no YouTube...
                  </div>
                )}

                {!searchLoading && searchResults.length > 0 && (
                  <section className="rounded-[1.75rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,18,0.68)] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          Resultados
                        </p>
                        <p className="text-[13px] text-[var(--text-secondary)]">
                          Adicione faixas novas sem perder a visão da playlist.
                        </p>
                      </div>
                      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(12,18,27,0.82)] px-2 text-[11px] font-semibold text-white">
                        {searchResults.length}
                      </span>
                    </div>

                    <div className="grid max-h-[320px] gap-2 overflow-y-auto pr-1 xl:grid-cols-2">
                      {searchResults.map((result) => {
                        const isSelected = trackSourceKeys.has(
                          `${result.source}:${result.sourceId}`,
                        )

                        return (
                          <div
                            key={result.sourceId}
                            className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${
                              isSelected
                                ? 'border-[rgba(55,210,124,0.24)] bg-[rgba(11,29,19,0.78)]'
                                : 'border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,18,0.72)]'
                            }`}
                          >
                            {result.thumbnailUrl ? (
                              <img
                                src={result.thumbnailUrl}
                                alt=""
                                className="h-14 w-14 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.05)]">
                                <Disc3 className="h-5 w-5 text-[var(--text-muted)]" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[14px] font-semibold text-white">
                                {result.title}
                              </p>
                              <p className="truncate text-[12px] text-[var(--text-secondary)]">
                                {result.artist}
                              </p>
                              <p
                                className={`mt-1 text-[11px] ${
                                  isSelected
                                    ? 'text-[var(--accent-hover)]'
                                    : 'text-[var(--text-muted)]'
                                }`}
                              >
                                {isSelected
                                  ? 'Esta faixa ja esta na playlist.'
                                  : 'Detalhes completos ao adicionar'}
                              </p>
                            </div>

                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(55,210,124,0.26)] bg-[rgba(11,29,19,0.82)] px-3 py-1.5 text-[11px] font-semibold text-[var(--accent-hover)]">
                                <Check className="h-3.5 w-3.5" />
                                Na playlist
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() =>
                                  void handleAddSearchResult(result)
                                }
                                isLoading={
                                  addingSearchResultId === result.sourceId
                                }
                              >
                                Adicionar
                              </Button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}

                {!searchLoading &&
                  mediaInputTrimmed &&
                  !mediaInputIsUrl &&
                  searchResults.length === 0 &&
                  !mediaError && (
                    <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,18,0.7)] px-4 py-3 text-[13px] text-[var(--text-secondary)]">
                      Nenhum vídeo encontrado para essa busca.
                    </div>
                  )}

                {tracks.length === 0 ? (
                  <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.75rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,18,0.42)] px-4 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-elevated)]">
                      <Disc3 className="h-7 w-7 text-[var(--text-muted)] opacity-50" />
                    </div>
                    <p className="text-[15px] font-semibold text-white">
                      Playlist vazia
                    </p>
                    <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                      Use a busca acima ou cole um link para começar a montar o
                      set.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-[1.75rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,18,0.38)]">
                    <div className="border-b border-[var(--border-light)] px-6 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                        Faixas da playlist
                      </p>
                    </div>

                    <div className="divide-y divide-[var(--border-light)]">
                      {tracks.map((track, index) => (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.025 }}
                          onDragOver={(event) =>
                            handleTrackDragOver(event, track.id)
                          }
                          onDrop={(event) =>
                            void handleTrackDrop(event, track.id)
                          }
                          onDragLeave={(event) => {
                            const nextTarget =
                              event.relatedTarget as Node | null
                            if (!event.currentTarget.contains(nextTarget)) {
                              setDropTarget((current) =>
                                current?.trackId === track.id ? null : current,
                              )
                            }
                          }}
                          className={`group relative flex items-center gap-4 px-6 py-3 transition-colors hover:bg-[var(--bg-hover)] ${
                            draggedTrackId === track.id ? 'opacity-55' : ''
                          }`}
                        >
                          {dropTarget?.trackId === track.id &&
                          dropTarget.placement === 'before' ? (
                            <div className="pointer-events-none absolute inset-x-4 top-0 h-[2px] rounded-full bg-[var(--accent)] shadow-[0_0_0_1px_rgba(55,210,124,0.18)]" />
                          ) : null}

                          {dropTarget?.trackId === track.id &&
                          dropTarget.placement === 'after' ? (
                            <div className="pointer-events-none absolute inset-x-4 bottom-0 h-[2px] rounded-full bg-[var(--accent)] shadow-[0_0_0_1px_rgba(55,210,124,0.18)]" />
                          ) : null}

                          <div
                            draggable={!reordering}
                            onDragStart={(event) =>
                              handleTrackDragStart(event, track.id)
                            }
                            onDragEnd={handleTrackDragEnd}
                            className={`flex h-9 w-7 shrink-0 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(11,16,24,0.84)] text-[var(--text-muted)] ${
                              reordering
                                ? 'cursor-not-allowed opacity-40'
                                : 'cursor-grab active:cursor-grabbing'
                            }`}
                            aria-label="Arrastar para reordenar"
                            title="Arrastar para reordenar"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>

                          <span className="w-6 text-right text-[12px] font-medium text-[var(--text-muted)]">
                            {index + 1}
                          </span>

                          {track.thumbnailUrl ? (
                            <img
                              src={track.thumbnailUrl}
                              alt=""
                              className="h-11 w-11 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg-tertiary)]">
                              <Disc3 className="h-4 w-4 text-[var(--text-muted)]" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-medium text-white">
                              {track.title}
                            </p>
                            <p className="truncate text-[12px] text-[var(--text-secondary)]">
                              {track.artist}
                            </p>
                          </div>

                          <span className="hidden rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(12,18,27,0.82)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] sm:inline-flex">
                            {track.source}
                          </span>

                          <span className="text-[12px] text-[var(--text-muted)]">
                            {Math.floor(track.durationMs / 60000)}:
                            {String(
                              Math.floor((track.durationMs % 60000) / 1000),
                            ).padStart(2, '0')}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                void handleMoveTrackToFirst(track.id)
                              }
                              disabled={index === 0 || reordering}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(11,16,24,0.84)] text-[var(--text-secondary)] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Mover para o topo"
                              title="Mover para o topo"
                            >
                              <ChevronsUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                void removeTrack(selected.id, track.id)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,97,88,0.16)] bg-[rgba(44,14,16,0.86)] text-[var(--danger)] transition-colors hover:text-red-300"
                              aria-label="Remover faixa"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[14px] text-[var(--text-muted)]">
              Selecione uma playlist
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function reorderTrackIds(
  trackIds: string[],
  draggedTrackId: string,
  targetTrackId: string,
  placement: 'before' | 'after',
) {
  if (draggedTrackId === targetTrackId) {
    return trackIds
  }

  const nextTrackIds = trackIds.filter((trackId) => trackId !== draggedTrackId)
  const targetIndex = nextTrackIds.indexOf(targetTrackId)

  if (targetIndex < 0) {
    return trackIds
  }

  const insertAt = placement === 'before' ? targetIndex : targetIndex + 1
  nextTrackIds.splice(insertAt, 0, draggedTrackId)
  return nextTrackIds
}
