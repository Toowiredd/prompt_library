/**
 * Database schema and operations for prompt library
 * Last Updated: 2025-02-08 11:02:29
 * @author Toowiredd
 */

import { drizzle } from "npm:drizzle-orm/libsql";
import { 
  sqliteTable, 
  text, 
  integer, 
  primaryKey 
} from "npm:drizzle-orm/sqlite-core";
import { sql } from "npm:drizzle-orm";
import { sqlite } from "https://esm.town/v/std/sqlite";
import type { PromptTemplate, PromptExecutionResult } from "./types";

// Schema definitions
export const templates = sqliteTable("prompt_templates", {
  id: text("id").primaryKey(),
  version: text("version").notNull(),
  description: text("description").notNull(),
  template: text("template").notNull(),
  parameters: text("parameters").notNull(), // JSON string
  category: text("category").notNull(),
  author: text("author").notNull(),
  lastUpdated: text("last_updated").notNull(),
  metadata: text("metadata").notNull(), // JSON string
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const executions = sqliteTable("prompt_executions", {
  id: text("id").primaryKey(),
  templateId: text("template_id")
    .notNull()
    .references(() => templates.id),
  input: text("input").notNull(), // JSON string
  output: text("output").notNull(), // JSON string
  timestamp: text("timestamp").notNull(),
  executionTime: integer("execution_time").notNull(),
  success: integer("success").notNull(),
  error: text("error"), // JSON string
  metadata: text("metadata"), // JSON string
});

// Initialize database
const db = drizzle(sqlite);

// Database operations
export class PromptDatabase {
  static async createTemplate(template: PromptTemplate): Promise<string> {
    const id = `${template.category}_${Date.now()}`;
    await db.insert(templates).values({
      id,
      ...template,
      parameters: JSON.stringify(template.parameters),
      metadata: JSON.stringify(template.metadata),
    });
    return id;
  }

  static async getTemplate(id: string): Promise<PromptTemplate | null> {
    const result = await db
      .select()
      .from(templates)
      .where(sql`id = ${id}`)
      .get();

    if (!result) return null;

    return {
      ...result,
      parameters: JSON.parse(result.parameters),
      metadata: JSON.parse(result.metadata),
    };
  }

  static async listTemplates(category?: string) {
    const query = db.select().from(templates);
    if (category) {
      query.where(sql`category = ${category}`);
    }
    const results = await query.all();

    return results.map(result => ({
      ...result,
      parameters: JSON.parse(result.parameters),
      metadata: JSON.parse(result.metadata),
    }));
  }

  static async logExecution(result: PromptExecutionResult) {
    await db.insert(executions).values({
      id: result.id,
      templateId: result.templateId,
      input: JSON.stringify(result.input),
      output: JSON.stringify(result.output),
      timestamp: result.timestamp,
      executionTime: result.executionTime,
      success: result.success ? 1 : 0,
      error: result.error ? JSON.stringify(result.error) : null,
      metadata: result.metadata ? JSON.stringify(result.metadata) : null,
    });
  }

  static async getExecutions(templateId: string, limit = 10) {
    const results = await db
      .select()
      .from(executions)
      .where(sql`template_id = ${templateId}`)
      .limit(limit)
      .orderBy(sql`timestamp DESC`)
      .all();

    return results.map(result => ({
      ...result,
      input: JSON.parse(result.input),
      output: JSON.parse(result.output),
      error: result.error ? JSON.parse(result.error) : null,
      metadata: result.metadata ? JSON.parse(result.metadata) : null,
    }));
  }
}