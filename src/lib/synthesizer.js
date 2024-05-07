import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isDatabaseSegment, parseDatabaseSegment } from './common.js';

export async function synthesize({ databasesPath, segmentsPath }) {
  const databases = JSON.parse(await readFile(databasesPath, 'utf8'));

  const segmentFiles = (await readdir(segmentsPath)).sort((a, b) => {
    const aIndex = parseInt(a.match(/\d+/)[0]);
    const bIndex = parseInt(b.match(/\d+/)[0]);
    return aIndex - bIndex;
  });
  const segments = await Promise.all(
    segmentFiles.map(file => readFile(join(segmentsPath, file), 'utf8')),
  );

  const databaseSegment = segments[databases.databaseSegmentIndex];
  if (!databaseSegment || !isDatabaseSegment(databaseSegment)) {
    throw new Error('Database segment not found');
  }

  const { columns, rows, detailsIndex, idIndex, databaseCopyClause } =
    parseDatabaseSegment(databaseSegment);

  rows.forEach(row => {
    const id = row[idIndex];
    const details = databases.databases.find(db => db.id === id)?.details;
    if (!details) {
      throw new Error(`Database with id ${id} not found`);
    }
    row[detailsIndex] = JSON.stringify(details);
  });

  segments[databases.databaseSegmentIndex] =
    `${databaseCopyClause} (${columns.join(', ')}) FROM stdin;
${rows.map(row => row.join('\t')).join('\n')}
\\.
`;

  return segments.join('\n\n');
}
