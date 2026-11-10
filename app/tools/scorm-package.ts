import { execFileSync } from 'child_process';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { crc32, deflateRawSync } from 'zlib';

/**
 * Packs the SCORM 1.2 build for an LMS: the app as one HTML file plus the
 * manifest, zipped with both at the root. Run after `vite build --mode scorm`
 * (npm run scorm:build). The ZIP is written here rather than with a zip
 * program, so it works the same on Windows.
 */

const DIST = resolve(__dirname, '../dist-scorm');
const PACKAGE_DIR = join(DIST, 'package');
const ZIP_FILE = join(DIST, 'copilot-odyssee-scorm12.zip');
const IDENTIFIER = 'ch.dertour.copilot-odyssee';
const TITLE = 'Copilot Odyssee';

const { version } = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8')) as { version: string };

// No mastery score: the course reports "completed" itself once every basic island is done (see docs/LMS.md).
const MANIFEST = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${IDENTIFIER}" version="${version}"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="odyssee-org">
    <organization identifier="odyssee-org">
      <title>${TITLE}</title>
      <item identifier="odyssee-item" identifierref="odyssee-sco" isvisible="true">
        <title>${TITLE}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="odyssee-sco" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>
`;

interface ZipEntry {
  name: string;
  data: Buffer;
}

/** Date and time in the MS-DOS format the ZIP headers use. */
function dosDateTime(date: Date): { time: number; day: number } {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    day: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  };
}

/** A plain ZIP: deflated entries, then the central directory and its end record. */
function zip(entries: ZipEntry[], date: Date): Buffer {
  const { time, day } = dosDateTime(date);
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  entries.forEach((entry) => {
    const name = Buffer.from(entry.name, 'utf8');
    const compressed = deflateRawSync(entry.data, { level: 9 });
    const crc = crc32(entry.data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); // local file header signature
    local.writeUInt16LE(20, 4); // version needed: 2.0 (deflate)
    local.writeUInt16LE(0x0800, 6); // flags: names are UTF-8
    local.writeUInt16LE(8, 8); // method: deflate
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28); // extra field length
    locals.push(local, name, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); // central directory header signature
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(day, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    // Extra field, comment, disk number, internal and external attributes stay 0.
    central.writeUInt32LE(offset, 42); // offset of the local header
    centrals.push(central, name);

    offset += local.length + name.length + compressed.length;
  });

  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); // end of central directory signature
  end.writeUInt16LE(entries.length, 8); // entries on this disk
  end.writeUInt16LE(entries.length, 10); // entries in total
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16); // where the central directory starts
  return Buffer.concat([...locals, directory, end]);
}

mkdirSync(PACKAGE_DIR, { recursive: true });
// The same inlining as the team edition, so the package is a single page without asset paths.
execFileSync(process.execPath, ['--import', 'tsx', join(__dirname, 'inline-html.ts'), join(DIST, 'index.html'), join(PACKAGE_DIR, 'index.html')], {
  stdio: 'inherit'
});
writeFileSync(join(PACKAGE_DIR, 'imsmanifest.xml'), MANIFEST);

const entries: ZipEntry[] = ['imsmanifest.xml', 'index.html'].map((name) => ({ name, data: readFileSync(join(PACKAGE_DIR, name)) }));
writeFileSync(ZIP_FILE, zip(entries, new Date()));
console.log(`${ZIP_FILE}: ${Math.round(statSync(ZIP_FILE).size / 1024)} KB`);
