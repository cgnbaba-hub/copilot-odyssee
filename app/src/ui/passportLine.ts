/**
 * The name line of the machine-readable zone in the passport, as in a real
 * one: surname, two fillers, given names, all in capital letters A to Z.
 */
const PLAIN: Record<string, string> = { Ä: 'AE', Ö: 'OE', Ü: 'UE', ß: 'SS', É: 'E', È: 'E', Ê: 'E', À: 'A', Â: 'A', Ç: 'C', Ô: 'O', Î: 'I', Ï: 'I', Ñ: 'N' };

function plain(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .map((c) => PLAIN[c] || c)
    .join('')
    .replace(/[^A-Z]+/g, '<')
    .replace(/^<+|<+$/g, '');
}

export const MRZ_LENGTH = 34;

/** «Anna Muster» becomes MUSTER<<ANNA; «Muster, Anna» as well. Without a name the fallback is used. */
export function mrzName(displayName: string | undefined, fallback: string): string {
  const name = (displayName || '').trim();
  let line: string;
  if (!name) line = plain(fallback);
  else if (name.indexOf(',') >= 0) {
    const [surname, given] = name.split(',');
    line = `${plain(surname)}<<${plain(given || '')}`;
  } else {
    const parts = name.split(/\s+/);
    const surname = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    const given = parts.length > 1 ? parts.slice(0, -1).join(' ') : '';
    line = given ? `${plain(surname)}<<${plain(given)}` : plain(surname);
  }
  return `P<CHE${line}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`.slice(0, MRZ_LENGTH);
}
