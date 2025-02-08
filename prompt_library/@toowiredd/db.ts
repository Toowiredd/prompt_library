/**
 * Database operations for prompt library
 * Created: 2025-02-08 11:05:26 UTC
 * Author: @toowiredd
 */

import { sqlite } from "https://esm.town/v/std/sqlite";
import { PromptTemplate, PromptExecutionResult } from "https://esm.town/v/@toowiredd/types";

// Initialize tables if they don't exist
await sqlite.execute(`
  CREATE TABLE IF NOT EXISTS prompt_templates (
    id TEXT PRIMARY KEY,
    version TEXT NOT NULL,
    description TEXT NOT NULL,
    template TEXT NOT NULL,
    parameters TEXT NOT NULL,
    category TEXT NOT NULL,
    author TEXT NOT NULL,
    last_updated TEXT NOT NULL,
    metadata TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS prompt_executions (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    input TEXT NOT NULL,
    output TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    execution_time INTEGER NOT NULL,
    success INTEGER NOT NULL,
    error TEXT,
    metadata TEXT,
    FOREIGN KEY(template_id) REFERENCES prompt_templates(id)
  );

  CREATE INDEX IF NOT EXISTS idx_templates_category ON prompt_templates(category);
  CREATE INDEX IF NOT EXISTS idx_executions_template ON prompt_executions(template_id, timestamp);
`);

export async function createTemplate(template: PromptTemplate): Promise<string> {
  const id = `tmpl_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  
  await sqlite.execute({
    sql: `INSERT INTO prompt_templates 
          (id, version, description, template, parameters, category, author, last_updated, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      template.version,
      template.description,
      template.template,
      JSON.stringify(template.parameters),
      template.category,
      template.author,
      template.lastUpdated,
      JSON.stringify(template.metadata),
    ],
  });

  return id;
}

export async function getTemplate(id: string): Promise<PromptTemplate | null> {
  const result = await sqlite.execute({
    sql: `SELECT * FROM prompt_templates WHERE id = ?`,
    args: [id],
  });

  if (!result.rows[0]) return null;

  const row = result.rows[0];
  return {
    ...row,
    parameters: JSON.parse(row.parameters),
    metadata: JSON.parse(row.metadata),
  };
}

export async function logExecution(result: PromptExecutionResult) {
  await sqlite.execute({
    sql: `INSERT INTO prompt_executions 
          (id, template_id, input, output, timestamp, execution_time, success, error, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      result.id,
      result.templateId,
      JSON.stringify(result.input),
      JSON.stringify(result.output),
      result.timestamp,
      result.executionTime,
      result.success ? 1 : 0,
      result.error ? JSON.stringify(result.error) : null,
      JSON.stringify(result.metadata),
    ],
  });
}

export async function getExecutionHistory(
  templateId: string,
  limit = 10
): Promise<PromptExecutionResult[]> {
  const results = await sqlite.execute({
    sql: `SELECT * FROM prompt_executions 
          WHERE template_id = ? 
          ORDER BY timestamp DESC 
          LIMIT ?`,
    args: [templateId, limit],
  });

  return results.rows.map(row => ({
    ...row,
    input: JSON.parse(row.input),
    output: JSON.parse(row.output),
    error: row.error ? JSON.parse(row.error) : undefined,
    metadata: JSON.parse(row.metadata),
    success: Boolean(row.success),
  }));
}