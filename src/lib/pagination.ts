export type PageItem = number | 'gap-left' | 'gap-right';

/**
 * Generate a compact page-number list with ellipsis gaps.
 * Examples (current, total, siblings=1, boundary=1):
 *   (1, 5) -> [1,2,3,4,5]
 *   (1, 20) -> [1,2,'gap-right',20]
 *   (10, 20) -> [1,'gap-left',9,10,11,'gap-right',20]
 *   (20, 20) -> [1,'gap-left',19,20]
 */
export function getPageNumbers(current: number, total: number, siblings = 1, boundary = 1): PageItem[] {
  if (total <= siblings * 2 + boundary * 2 + 3) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblings, boundary + 1);
  const rightSibling = Math.min(current + siblings, total - boundary);
  const showLeftGap = leftSibling > boundary + 1;
  const showRightGap = rightSibling < total - boundary;

  const out: PageItem[] = [];
  for (let i = 1; i <= boundary; i++) out.push(i);
  if (showLeftGap) out.push('gap-left');
  for (let i = leftSibling; i <= rightSibling; i++) out.push(i);
  if (showRightGap) out.push('gap-right');
  for (let i = total - boundary + 1; i <= total; i++) out.push(i);
  return out;
}
