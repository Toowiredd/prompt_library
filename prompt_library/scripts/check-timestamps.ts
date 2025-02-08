import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
const CURRENT_TIME = "2025-02-08 11:36:20";

function validateTimestamp(timestamp: string): boolean {
  if (!TIMESTAMP_REGEX.test(timestamp)) {
    return false;
  }
  
  const timestampDate = new Date(timestamp.replace(' ', 'T'));
  const currentDate = new Date(CURRENT_TIME.replace(' ', 'T'));
  
  return timestampDate <= currentDate;
}

async function checkFile(filePath: string): Promise<boolean> {
  try {
    const content = JSON.parse(readFileSync(filePath, 'utf-8'));
    
    if (content.created && !validateTimestamp(content.created)) {
      console.error(`❌ Invalid timestamp in ${filePath}: ${content.created}`);
      return false;
    }
    
    console.log(`✅ Valid timestamps in ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error checking ${filePath}:`, error);
    return false;
  }
}

async function main() {
  const configFiles = [
    ...readdirSync('./vals').map(f => join('./vals', f)),
    ...readdirSync('./docs').map(f => join('./docs', f))
  ].filter(f => f.endsWith('.json'));
  
  const results = await Promise.all(configFiles.map(checkFile));
  
  if (!results.every(Boolean)) {
    process.exit(1);
  }
}

main().catch(console.error);