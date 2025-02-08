import { z } from 'zod';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Schema definitions
const AuthorSchema = z.object({
  github: z.literal('toowiredd'),
  valtown: z.literal('toowired')
});

const TimestampSchema = z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);

const BaseConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  created: TimestampSchema,
  author: AuthorSchema
});

const ValMethodSchema = z.object({
  input: z.record(z.any()).optional(),
  output: z.any(),
  error: z.any().optional()
});

const ValConfigSchema = BaseConfigSchema.extend({
  description: z.string(),
  methods: z.record(ValMethodSchema)
});

async function validateConfig(filePath: string): Promise<boolean> {
  try {
    const content = JSON.parse(readFileSync(filePath, 'utf-8'));
    
    if (filePath.includes('vals/')) {
      await ValConfigSchema.parseAsync(content);
    } else {
      await BaseConfigSchema.parseAsync(content);
    }
    
    console.log(`✅ Valid configuration: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Invalid configuration in ${filePath}:`, error);
    return false;
  }
}

async function main() {
  const configFiles = readdirSync('./vals').filter(f => f.endsWith('.json'));
  const results = await Promise.all(
    configFiles.map(file => validateConfig(join('./vals', file)))
  );
  
  const valid = results.every(Boolean);
  if (!valid) {
    process.exit(1);
  }
}

main().catch(console.error);