const shanghaiDateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});

export const formatDateTimeInShanghai = (value: string | number | Date) => {
  const parts: Record<string, string> = {};
  for (const part of shanghaiDateTimeFormatter.formatToParts(new Date(value))) {
    if (part.type !== 'literal') {
      parts[part.type] = part.value;
    }
  }
  return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
};

const shanghaiYearFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric'
});

export const getCurrentYearInShanghai = () => shanghaiYearFormatter.format(new Date());
