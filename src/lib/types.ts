export const songStatusOptions = ['ready', 'learning', 'resting'] as const;
export type SongStatus = (typeof songStatusOptions)[number];

export const songLanguageOptions = ['未指定', '中文', '英语', '日语', '其他'] as const;
export type SongLanguage = (typeof songLanguageOptions)[number];
export const defaultSongLanguage: SongLanguage = '未指定';

export const requestStatusOptions = ['pending', 'reviewing', 'planned', 'declined'] as const;
export type RequestStatus = (typeof requestStatusOptions)[number];

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
  accent: string;
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

export interface PublicCatalog {
  streamer: StreamerProfile;
  songs: Song[];
  tags: string[];
  languages: readonly SongLanguage[];
  statuses: readonly SongStatus[];
  stats: CatalogStats;
}

export interface AdminDashboardData {
  streamer: StreamerProfile;
  songs: Song[];
  requests: SongRequest[];
  overview: CatalogStats;
}

export const songStatusLabels: Record<SongStatus, string> = {
  ready: '可唱',
  learning: '学习中',
  resting: '暂不开放'
};

export const requestStatusLabels: Record<RequestStatus, string> = {
  pending: '待处理',
  reviewing: '评估中',
  planned: '已加入计划',
  declined: '暂不考虑'
};
