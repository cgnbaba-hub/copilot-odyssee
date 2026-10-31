/** Address of this page that opens the given island or stage directly; other parameters stay. */
export function linkTo(kind: 'insel' | 'etappe', id: string): string {
  const url = new URL(window.location.href);
  url.searchParams.delete('insel');
  url.searchParams.delete('etappe');
  url.searchParams.set(kind, id);
  url.hash = '';
  return url.toString();
}
