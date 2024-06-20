const DATABASE_SEGMENT_SEARCH_STRING = /--[\s\S]+?COPY \w+\.metabase_database/;

export function isDatabaseSegment(segment) {
  return DATABASE_SEGMENT_SEARCH_STRING.test(segment);
}

export function parseDatabaseSegment(segment) {
  if (!isDatabaseSegment(segment)) {
    throw new Error('Not a database segment');
  }

  const [header, ...body] = segment
    .replaceAll(/--[^(]+\s\(|\).+;|\\\.\s+/g, '')
    .trim()
    .split('\n');

  const columns = header.split(/,\s+/);
  const rows = body.map(line => line.split(/\t/));

  const idIndex = columns.indexOf('id');
  const nameIndex = columns.indexOf('name');
  const detailsIndex = columns.indexOf('details');

  const databaseCopyClause = DATABASE_SEGMENT_SEARCH_STRING.exec(segment)[0];

  return {
    columns,
    rows,
    idIndex,
    nameIndex,
    detailsIndex,
    databaseCopyClause,
  };
}
