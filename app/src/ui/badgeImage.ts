/**
 * Browser-only helpers to save a rendered badge SVG as a file. Kept apart from
 * core/progress so that unit tests (Node, no DOM) never load them.
 */

const SIZE = 1024;

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function serialise(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  // An SVG used as an image needs a size of its own, or browsers pick an arbitrary one.
  clone.setAttribute('width', String(SIZE));
  clone.setAttribute('height', String(SIZE));
  return new XMLSerializer().serializeToString(clone);
}

/** Downloads the badge as a 1024×1024 PNG. Returns false when it had to fall back to the SVG file. */
export function downloadBadge(svg: SVGSVGElement, basename: string): Promise<boolean> {
  const source = serialise(svg);
  const fallback = (): boolean => {
    saveBlob(new Blob([source], { type: 'image/svg+xml' }), `${basename}.svg`);
    return false;
  };
  return new Promise<boolean>((resolve) => {
    try {
      const image = new Image();
      image.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = SIZE;
          canvas.height = SIZE;
          const context = canvas.getContext('2d');
          if (!context) return resolve(fallback());
          context.drawImage(image, 0, 0, SIZE, SIZE);
          canvas.toBlob((blob) => {
            if (!blob) return resolve(fallback());
            saveBlob(blob, `${basename}.png`);
            resolve(true);
          }, 'image/png');
        } catch {
          resolve(fallback());
        }
      };
      image.onerror = () => resolve(fallback());
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
    } catch {
      resolve(fallback());
    }
  });
}
