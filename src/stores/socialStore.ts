import { create } from 'zustand'
import { api } from '../lib/api'

interface Friend {
  id: string
  username: string
  avatar: string | null
  friendshipId?: string
}

interface FanEntry {
  id: string
  followerId?: string
  followeeId?: string
  username: string
  avatar: string | null
  createdAt: string
}

interface PendingRequest {
  id: string
  requesterId: string
  username: string
  avatar: string | null
  createdAt: string
}

interface SocialState {
  friends: Friend[]
  followers: FanEntry[]
  following: FanEntry[]
  pendingRequests: PendingRequest[]
  loading: boolean

  fetchFriends: () => Promise<void>
  fetchFollowers: () => Promise<void>
  fetchFollowing: () => Promise<void>
  fetchPendingRequests: () => Promise<void>
  follow: (userId: string) => Promise<void>
  unfollow: (userId: string) => Promise<void>
  sendFriendRequest: (userId: string) => Promise<void>
  acceptRequest: (requestId: string) => Promise<void>
  rejectRequest: (requestId: string) => Promise<void>
  removeFriend: (friendshipId: string) => Promise<void>
}

export const useSocialStore = create<SocialState>((set, get) => ({
  friends: [],
  followers: [],
  following: [],
  pendingRequests: [],
  loading: false,

  fetchFriends: async () => {
    const data = await api<Friend[]>('/api/friends')
    set({ friends: data })
  },

  fetchFollowers: async () => {
    const data = await api<FanEntry[]>('/api/fans/followers')
    set({ followers: data })
  },

  fetchFollowing: async () => {
    const data = await api<FanEntry[]>('/api/fans/following')
    set({ following: data })
  },

  fetchPendingRequests: async () => {
    const data = await api<PendingRequest[]>('/api/friends/pending')
    set({ pendingRequests: data })
  },

  follow: async (userId: string) => {
    await api(`/api/fans/${userId}`, { method: 'POST' })
    await get().fetchFollowing()
  },

  unfollow: async (userId: string) => {
    await api(`/api/fans/${userId}`, { method: 'DELETE' })
    set((s) => ({
      following: s.following.filter((f) => f.followeeId !== userId),
    }))
  },

  sendFriendRequest: async (userId: string) => {
    await api(`/api/friends/request/${userId}`, { method: 'POST' })
  },

  acceptRequest: async (requestId: string) => {
    await api(`/api/friends/accept/${requestId}`, { method: 'POST' })
    set((s) => ({
      pendingRequests: s.pendingRequests.filter((r) => r.id !== requestId),
    }))
    await get().fetchFriends()
  },

  rejectRequest: async (requestId: string) => {
    await api(`/api/friends/reject/${requestId}`, { method: 'POST' })
    set((s) => ({
      pendingRequests: s.pendingRequests.filter((r) => r.id !== requestId),
    }))
  },

  removeFriend: async (friendshipId: string) => {
    await api(`/api/friends/${friendshipId}`, { method: 'DELETE' })
    set((s) => ({
      friends: s.friends.filter((f) => f.friendshipId !== friendshipId),
    }))
  },
}))
