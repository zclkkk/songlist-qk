export const songStatusOptions = ['ready', 'learning', 'resting'] as const;
export type SongStatus = (typeof songStatusOptions)[number];

export const songLanguageOptions = ['中文', '英语', '日语', '其他'] as const;
export type SongLanguage = (typeof songLanguageOptions)[number];

export const requestStatusOptions = ['pending', 'accepted', 'refused'] as const;
export type RequestStatus = (typeof requestStatusOptions)[number];
export const requestDecisionOptions = ['accepted', 'refused'] as const satisfies readonly RequestStatus[];
export type RequestDecision = (typeof requestDecisionOptions)[number];

export interface Song {
  id: string;
  title: string;
  artist: string;
  language: SongLanguage;
  status: SongStatus;
  tags: string[];
  isPublic: boolean;
}

export interface SongRequest {
  id: string;
  songTitle: string;
  artist: string;
  language: SongLanguage;
  message: string;
  requesterName: string | null;
  status: RequestStatus;
  matchedSongId: string | null;
  createdAt: string;
}

export interface StreamerProfile {
  name: string;
  tagline: string;
  description: string;
  platforms: Array<{
    label: string;
    href: string;
  }>;
}

export interface CatalogStats {
  totalSongs: number;
  publicSongs: number;
  pendingRequests: number;
}

export interface PageSettings {
  avatar: string;
  background: string;
  heroTitle: string;
}

export interface PublicCatalog {
  streamer: StreamerProfile;
  songs: Song[];
  tags: string[];
  settings: PageSettings;
}

export interface AdminDashboardData {
  streamer: StreamerProfile;
  songs: Song[];
  requests: SongRequest[];
  overview: CatalogStats;
  settings: PageSettings;
}

export const songStatusLabels: Record<SongStatus, string> = {
  ready: '可唱',
  learning: '学习中',
  resting: '暂不开放'
};

export const requestStatusLabels: Record<RequestStatus, string> = {
  pending: '待处理',
  accepted: '已接受',
  refused: '已拒绝'
};
