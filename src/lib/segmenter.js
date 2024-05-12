import { readFile } from 'node:fs/promises';
import { parseDatabaseSegment, isDatabaseSegment } from './common.js';

export async function segment({ sqlPath, redact }) {
  const sql = await readFile(sqlPath, 'utf8');

  const match = sql.matchAll(/--\r?\n--.+\r?\n--$/gm);

  const segments = [];
  let databaseSegmentIndex = null;

  let start = null;
  for (const m of match) {
    if (start == null) {
      start = m.index;
      continue;
    }

    const segment = sql.slice(start, m.index);
    segments.push(segment);

    if (isDatabaseSegment(segment)) {
      if (databaseSegmentIndex != null) {
        throw new Error('Multiple database segments found');
      }
      databaseSegmentIndex = segments.length - 1;
    }

    start = m.index;
  }
  segments.push(sql.slice(start));

  // parse database segment
  const databaseSegment = segments[databaseSegmentIndex];

  const { rows, idIndex, nameIndex, detailsIndex } =
    parseDatabaseSegment(databaseSegment);

  const databases = rows.map(row => {
    const details = JSON.parse(row[detailsIndex]);
    if (redact) {
      ['host', 'user', 'password'].forEach(key => {
        details[key] = '**REDACTED**';
      });
    }
    return {
      id: row[idIndex],
      name: row[nameIndex],
      details,
    };
  });

  return {
    databaseSegmentIndex,
    databases,
    segments,
  };
}
