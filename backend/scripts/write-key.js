import fs from 'fs';

const pem = (process.env.PRIVATE_KEY || '').replace(/\\n/g, '\n');
if (!pem) {
  console.error('PRIVATE_KEY missing');
  process.exit(1);
}

// Allow filename to be set via command line argument or environment variable, fallback to default
const target =
  process.argv[2] ||
  process.env.PRIVATE_KEY_FILENAME ||
  'policy-access.private-key.pem';
if (!fs.existsSync(target)) {
  fs.writeFileSync(target, pem, { mode: 0o600 });
  console.log(`Wrote ${target}`);
} else {
  console.log(`${target} already exists, skipping`);
}
