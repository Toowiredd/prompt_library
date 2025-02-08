import { ValTown } from '@val-town/api';
import { readFileSync } from 'fs';
import { join } from 'path';

const valtown = new ValTown({
  apiKey: process.env.VAL_TOWN_API_KEY
});

const VALS_DIR = join(__dirname, '..', 'vals');

async function createVal(filename: string) {
  const content = JSON.parse(readFileSync(join(VALS_DIR, filename), 'utf-8'));
  
  try {
    await valtown.vals.create({
      name: content.name,
      code: `export const ${content.name.split('/')[1]} = ${JSON.stringify(content, null, 2)}`,
      privacy: 'public'
    });
    console.log(`✅ Created val: ${content.name}`);
  } catch (error) {
    console.error(`❌ Failed to create val ${content.name}:`, error);
  }
}

async function main() {
  const vals = [
    'prompt-types.json',
    'prompt-store.json',
    'prompt-executor.json',
    'prompt-api.json',
    'prompt-sync.json',
    'prompt-cache.json',
    'prompt-suggestions.json',
    'prompt-testing.json',
    'prompt-docs.json',
    'prompt-workflows.json',
    'prompt-search.json',
    'prompt-optimizer.json'
  ];

  for (const val of vals) {
    await createVal(val);
  }
}

main().catch(console.error);