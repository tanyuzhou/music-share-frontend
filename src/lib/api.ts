export type ApiResponse<T> = {
  code: number;
  msg: string;
  data: T;
};

export type User = {
  id: string;
  username: string;
  email: string;
  role: "LISTENER" | "MODERATOR" | "SUPER_ADMIN";
  displayName: string;
  isActive: boolean;
};

export type MyProfile = User & {
  bio: string;
  favoriteGenre: string;
  favoritesVisibility: "PRIVATE" | "PUBLIC";
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = {
  id: string;
  username: string;
  role: "LISTENER" | "MODERATOR" | "SUPER_ADMIN";
  displayName: string;
  bio?: string;
  favoriteGenre?: string;
  createdAt?: string;
};

export type Track = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  releaseDate?: string;
  primaryGenreName?: string;
  trackTimeMillis?: number;
  artworkUrl100?: string;
  previewUrl?: string;
  trackViewUrl?: string;
};

export type Review = {
  id: string;
  appleTrackId: number;
  rating: number;
  text: string;
  status: string;
  moderationReason: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
  };
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
};

export type Playlist = {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  owner: {
    id: string;
    username?: string;
    displayName?: string;
  };
  trackItems: Array<{
    trackId: number;
    trackName: string;
    artistName: string;
    artworkUrl100?: string;
    trackViewUrl?: string;
  }>;
};

export type Favorite = {
  id: string;
  appleTrackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
  createdAt: string;
};

export type FollowUser = {
  id: string;
  username: string;
  displayName: string;
  role: "LISTENER" | "MODERATOR" | "SUPER_ADMIN";
  createdAt: string;
};

export type HomePublicFeed = {
  latestPublicPlaylists: Array<{ id: string; title: string; description: string; owner: { id: string; username?: string; displayName?: string } }>;
  latestReviews: Array<{ id: string; appleTrackId: number; rating: number; text: string; trackName?: string; artistName?: string; artworkUrl100?: string; author: { id: string; username: string; displayName: string } }>;
  latestUsers: Array<{ id: string; username: string; displayName: string; role: "LISTENER" | "MODERATOR" | "SUPER_ADMIN"; createdAt: string }>;
};

export type HomeMyFeed = {
  myRecentReviews: Array<{ id: string; appleTrackId: number; rating: number; text: string; trackName?: string; artistName?: string; artworkUrl100?: string }>;
  myRecentPlaylists: Array<{ id: string; title: string; isPublic: boolean }>;
  myRecentFavorites: Array<{ id: string; appleTrackId: number; trackName: string; artistName: string; artworkUrl100?: string }>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    ...init
  });

  const payload = (await response.json()) as ApiResponse<T>;
  return payload;
}

export const api = {
  me: () => request<{ user: User }>("/auth/me"),
  login: (usernameOrEmail: string, password: string) =>
    request<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ usernameOrEmail, password })
    }),
  register: (username: string, email: string, password: string, displayName: string) =>
    request<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password, displayName })
    }),
  logout: () => request<{}>("/auth/logout", { method: "POST" }),

  getHomePublicFeed: () => request<HomePublicFeed>("/home/public"),
  getHomeMyFeed: () => request<HomeMyFeed>("/home/me"),

  getMyProfile: () => request<{ user: MyProfile }>("/users/me"),
  updateMyProfile: (payload: {
    displayName?: string;
    email?: string;
    bio?: string;
    favoriteGenre?: string;
    favoritesVisibility?: "PRIVATE" | "PUBLIC";
  }) =>
    request<{ user: MyProfile }>("/users/me", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  changeMyPassword: (currentPassword: string, newPassword: string) =>
    request<{}>("/users/me/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword })
    }),

  searchTracks: (criteria: string, page = 1, limit = 20) =>
    request<{ list: Track[]; page: number; limit: number; total: number; hasMore?: boolean }>(
      `/search?criteria=${encodeURIComponent(criteria)}&page=${page}&limit=${limit}`
    ),

  getTrack: (trackId: string | number) => request<Track>(`/tracks/${trackId}`),

  getTrackReviews: (trackId: string | number, page = 1, limit = 20) =>
    request<{ list: Review[]; page: number; limit: number; total: number }>(
      `/tracks/${trackId}/reviews?page=${page}&limit=${limit}`
    ),

  createTrackReview: (trackId: string | number, rating: number, text: string) =>
    request<{ review: Review }>(`/tracks/${trackId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, text })
    }),

  updateReview: (reviewId: string, rating: number, text: string) =>
    request<{ review: Review }>(`/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify({ rating, text })
    }),

  deleteReview: (reviewId: string) =>
    request<{}>(`/reviews/${reviewId}`, {
      method: "DELETE"
    }),

  getMyReviews: (page = 1, limit = 20) =>
    request<{ list: Review[]; page: number; limit: number; total: number }>(
      `/users/me/reviews?page=${page}&limit=${limit}`
    ),

  addFavorite: (track: Track) =>
    request<{ favorite: unknown }>("/users/me/favorites", {
      method: "POST",
      body: JSON.stringify({
        appleTrackId: track.trackId,
        trackName: track.trackName,
        artistName: track.artistName,
        artworkUrl100: track.artworkUrl100 || "",
        trackViewUrl: track.trackViewUrl || ""
      })
    }),

  removeFavorite: (trackId: number) =>
    request<{}>(`/users/me/favorites/${trackId}`, {
      method: "DELETE"
    }),

  getMyPlaylists: () => request<{ list: Playlist[]; page: number; limit: number; total: number }>("/users/me/playlists"),

  getMyFavorites: (page = 1, limit = 20) =>
    request<{ list: Favorite[]; page: number; limit: number; total: number }>(
      `/users/me/favorites?page=${page}&limit=${limit}`
    ),

  getUserPublic: (userId: string) => request<{ user: PublicUser }>(`/users/${userId}/public`),

  getUserPublicPlaylists: (userId: string) =>
    request<{ list: Playlist[]; page: number; limit: number; total: number }>(`/users/${userId}/playlists/public`),

  followUser: (userId: string) =>
    request<{ follow: { id: string } }>(`/users/${userId}/follow`, {
      method: "POST"
    }),

  unfollowUser: (userId: string) =>
    request<{}>(`/users/${userId}/follow`, {
      method: "DELETE"
    }),

  getFollowers: (userId: string, page = 1, limit = 20) =>
    request<{ list: FollowUser[]; page: number; limit: number; total: number }>(
      `/users/${userId}/followers?page=${page}&limit=${limit}`
    ),

  getFollowing: (userId: string, page = 1, limit = 20) =>
    request<{ list: FollowUser[]; page: number; limit: number; total: number }>(
      `/users/${userId}/following?page=${page}&limit=${limit}`
    ),

  adminListUsers: () => request<{ list: User[] }>("/admin/users"),
  adminUpdateUserRole: (userId: string, role: "LISTENER" | "MODERATOR" | "SUPER_ADMIN") =>
    request<{}>(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role })
    }),
  adminUpdateUserActive: (userId: string, isActive: boolean) =>
    request<{}>(`/admin/users/${userId}/active`, {
      method: "PATCH",
      body: JSON.stringify({ isActive })
    }),

  addTrackToPlaylist: (playlistId: string, track: Track) =>
    request<{ playlist: Playlist }>(`/playlists/${playlistId}/tracks`, {
      method: "POST",
      body: JSON.stringify({
        trackId: track.trackId,
        trackName: track.trackName,
        artistName: track.artistName,
        artworkUrl100: track.artworkUrl100 || "",
        trackViewUrl: track.trackViewUrl || ""
      })
    }),

  createPlaylist: (title: string, description: string, isPublic = false) =>
    request<{ playlist: Playlist }>("/playlists", {
      method: "POST",
      body: JSON.stringify({ title, description, isPublic })
    }),

  updatePlaylist: (playlistId: string, payload: Partial<Pick<Playlist, "title" | "description" | "isPublic">>) =>
    request<{ playlist: Playlist }>(`/playlists/${playlistId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  deletePlaylist: (playlistId: string) =>
    request<{}>(`/playlists/${playlistId}`, {
      method: "DELETE"
    }),

  removeTrackFromPlaylist: (playlistId: string, trackId: number) =>
    request<{ playlist: Playlist }>(`/playlists/${playlistId}/tracks/${trackId}`, {
      method: "DELETE"
    })
};
