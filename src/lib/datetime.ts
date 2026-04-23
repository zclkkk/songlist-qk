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

const shanghaiYearFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric'
});

const readParts = (formatter: Intl.DateTimeFormat, value: string | number | Date) =>
  formatter.formatToParts(new Date(value)).reduce<Record<string, string>>((parts, part) => {
    if (part.type !== 'literal') {
      parts[part.type] = part.value;
    }

    return parts;
  }, {});

export const formatDateTimeInShanghai = (value: string | number | Date) => {
  const parts = readParts(shanghaiDateTimeFormatter, value);

  return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
};

export const getCurrentYearInShanghai = (value: string | number | Date = new Date()) =>
  readParts(shanghaiYearFormatter, value).year;
