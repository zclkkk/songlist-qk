import type { StreamerProfile } from '$lib/types';

export const streamerProfile: StreamerProfile = {
  name: 'Airi Songboard',
  tagline: '直播查歌、收歌、管歌，一站完成。',
  description:
    '面向单主播直播场景的现代歌单站。观众可以快速查歌、按标签筛选并提交愿望单，主播可以在后台统一管理曲库与请求。',
  accent: 'bg-[#5e6ad2]',
  platforms: [
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/'
    },
    {
      label: 'Bilibili',
      href: 'https://www.bilibili.com/'
    },
    {
      label: 'X / Twitter',
      href: 'https://x.com/'
    }
  ]
};
