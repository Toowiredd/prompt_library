// @ts-expect-error Val Town import
import { sqlite } from "https://esm.town/v/std/sqlite";
import { drizzle } from "npm:drizzle-orm/libsql";
import { sqliteTable, text, integer } from "npm:drizzle-orm/sqlite-core";

// Define the database schema
const templates = sqliteTable("prompt_templates", {
  id: text("id").primaryKey(),
  version: text("version").notNull(),
  description: text("description").notNull(),
  template: text("template").notNull(),
  parameters: text("parameters").notNull(), // JSON string
  category: text("category").notNull(),
  author: text("author").notNull(),
  lastUpdated: text("lastUpdated").notNull(),
  metadata: text("metadata").notNull(), // JSON string
});

const db = drizzle(sqlite);

// Main prompt library functions
export async function createTemplate(template: PromptTemplate) {
  const id = `${template.category}_${Date.now()}`;
  await db.insert(templates).values({
    id,
    ...template,
    parameters: JSON.stringify(template.parameters),
    metadata: JSON.stringify(template.metadata),
  });
  return id;
}

export async function getTemplate(id: string) {
  const result = await db.select().from(templates).where({ id }).get();
  if (!result) return null;
  
  return {
    ...result,
    parameters: JSON.parse(result.parameters),
    metadata: JSON.parse(result.metadata),
  };
}

export async function listTemplates(category?: string) {
  const query = db.select().from(templates);
  if (category) {
    query.where({ category });
  }
  const results = await query.all();
  
  return results.map(result => ({
    ...result,
    parameters: JSON.parse(result.parameters),
    metadata: JSON.parse(result.metadata),
  }));
}