import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowUp,
  Search,
  Check,
  Disc3,
  Link2,
  ListMusic,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
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

function PlaylistsPage() {
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

  const handleMoveTrack = async (index: number, direction: -1 | 1) => {
    if (!selectedId || reordering) return

    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= tracks.length) return

    const nextTracks = [...tracks]
    const [movedTrack] = nextTracks.splice(index, 1)
    nextTracks.splice(targetIndex, 0, movedTrack)

    setReordering(true)
    try {
      await reorderTracks(
        selectedId,
        nextTracks.map((track) => track.id),
      )
    } finally {
      setReordering(false)
    }
  }

  const handleDeletePlaylist = async (playlistId: string) => {
    await deletePlaylist(playlistId)
    setMediaInput('')
    setMediaError(null)
    setSearchResults([])
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

  return (
    <div className="flex h-screen flex-1 flex-col overflow-hidden md:flex-row">
      <div className="flex w-full shrink-0 flex-col border-r border-[var(--border-light)] bg-[var(--bg-secondary)] md:w-72">
        <div className="border-b border-[var(--border-light)] p-4">
          <h2 className="mb-3 text-lg font-bold text-white">
            Minhas Playlists
          </h2>
          <div className="flex gap-2">
            <Input
              placeholder="Nova playlist..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleCreate()}
              className="flex-1 py-2 text-[13px]"
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
            <div className="sticky top-0 z-10 border-b border-[var(--border-light)] bg-[var(--bg-primary)]/92 px-6 py-4 backdrop-blur-xl">
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

                <div className="flex gap-2">
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

              <div className="mt-4 space-y-2">
                {searchLoading && (
                  <div className="flex items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,18,0.7)] px-4 py-3 text-[13px] text-[var(--text-secondary)]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando vídeos no YouTube...
                  </div>
                )}

                {!searchLoading && searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div
                        key={result.sourceId}
                        className="flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,18,0.72)] px-3 py-3"
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
                          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                            Detalhes completos ao adicionar
                          </p>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => void handleAddSearchResult(result)}
                          isLoading={addingSearchResultId === result.sourceId}
                        >
                          Adicionar
                        </Button>
                      </div>
                    ))}
                  </div>
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
              </div>
            </div>

            <div className="flex-1">
              {tracks.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-4 text-center">
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
                <div className="divide-y divide-[var(--border-light)]">
                  {tracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.025 }}
                      className="group flex items-center gap-4 px-6 py-3 transition-colors hover:bg-[var(--bg-hover)]"
                    >
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
                          onClick={() => void handleMoveTrack(index, -1)}
                          disabled={index === 0 || reordering}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(11,16,24,0.84)] text-[var(--text-secondary)] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Mover para cima"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => void handleMoveTrack(index, 1)}
                          disabled={index === tracks.length - 1 || reordering}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(11,16,24,0.84)] text-[var(--text-secondary)] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Mover para baixo"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
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
              )}
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
