import pg from 'pg';

export function createPool(opts) {
  const { Pool } = pg;
  const pool = new Pool({
    connectionString: opts.connectionString,
    user: opts.user,
    password: opts.password,
    host: opts.host,
    port: opts.port,
    database: opts.database,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  return pool;
}

