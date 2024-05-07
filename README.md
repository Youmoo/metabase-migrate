metabase-migrate
===============

A tool to split and combine Metabase's `pg_dump`'ed sql file to make Metabase version control friendly and migrate between Metabase instances/environments easily.


## Usage

```shell
# Split the pg_dump'ed sql file into multiple small files, so that we can easily version control and diff them
npx @youmoo/metabase-migrate segment --file=path/to/dumpped-sql-file --output=path/to/output

# Combine the split files into a single sql file, so that we can import it into a database for use with Metabase
npx @youmoo/metabase-migrate synthesize --databases=path/to/databases.json --segments=path/to/segments --output=path/to/output
```
