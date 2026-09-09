const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const dbPassword = process.env.SUPABASE_DB_PASSWORD || 'H51XBOZBynupfHWt';
const projectRef = 'ieqkpjsocukjilzeofpm';

const hosts = [
  `db.${projectRef}.supabase.co`,
  `aws-0-us-east-1.pooler.supabase.com`,
  `aws-0-us-west-1.pooler.supabase.com`,
  `aws-0-eu-central-1.pooler.supabase.com`,
  `aws-0-ap-southeast-1.pooler.supabase.com`,
  `aws-0-eu-west-1.pooler.supabase.com`,
  `aws-0-sa-east-1.pooler.supabase.com`,
  `aws-0-ap-northeast-1.pooler.supabase.com`
];

async function tryConnect() {
  const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'schema.sql'), 'utf-8');

  for (const host of hosts) {
    console.log(`Trying host: ${host}...`);
    const port = host.includes('pooler') ? 6543 : 5432;
    const user = host.includes('pooler') ? `postgres.${projectRef}` : 'postgres';
    
    const client = new Client({
      host,
      port,
      user,
      password: dbPassword,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 6000,
    });

    try {
      await client.connect();
      console.log(`Connected successfully to ${host}!`);
      console.log('Applying schema.sql...');
      await client.query(schemaSql);
      console.log('Schema applied successfully!');
      
      await client.query("NOTIFY pgrst, 'reload schema';");
      console.log('Schema cache reload notified!');
      
      await client.end();
      return true;
    } catch (err) {
      console.error(`Failed connecting to ${host}:`, err.message);
      try { await client.end(); } catch (_) {}
    }
  }
  return false;
}

tryConnect().then(success => {
  if (success) {
    console.log('SUCCESS: Database migration complete.');
    process.exit(0);
  } else {
    console.error('ERROR: Could not connect to any Postgres host.');
    process.exit(1);
  }
});
