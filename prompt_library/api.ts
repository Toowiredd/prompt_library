/**
 * HTTP API for prompt library
 * Last Updated: 2025-02-08 11:02:29
 * @author Toowiredd
 */

import { Hono } from "npm:hono";
import { timing } from "npm:hono/timing";
import { cors } from "npm:hono/cors";
import { PromptDatabase } from "./database";
import { PromptExecutor } from "./executor";
import { PromptTemplateSchema } from "./types";

const app = new Hono();

// Middleware
app.use("*", timing());
app.use("*", cors());

// Error handler
app.onError((err, c) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);
  return c.json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message,
    },
  }, 500);
});

// Routes
app.get("/templates/:category?", async (c) => {
  const category = c.param("category");
  const templates = await PromptDatabase.listTemplates(category);
  return c.json({ templates });
});

app.post("/templates", async (c) => {
  const body = await c.req.json();
  
  try {
    const template = await PromptTemplateSchema.parseAsync(body);
    const id = await PromptDatabase.createTemplate(template);
    return c.json({ id }, 201);
  } catch (error) {
    return c.json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid template format",
        details: error.errors,
      },
    }, 400);
  }
});

app.post("/execute/:templateId", async (c) => {
  const templateId = c.param("templateId");
  const body = await c.req.json();
  
  const executor = new PromptExecutor(c.env.OPENAI_API_KEY);
  const result = await executor.execute({
    templateId,
    parameters: body.parameters,
    timestamp: new Date().toISOString(),
    requestId: c.req.headers.get("x-request-id") || `req_${Date.now()}`,
    userId: c.req.headers.get("x-user-id") || "anonymous",
    metadata: body.metadata,
  });

  return c.json(result);
});

app.get("/executions/:templateId", async (c) => {
  const templateId = c.param("templateId");
  const limit = Number(c.query("limit")) || 10;
  
  const executions = await PromptDatabase.getExecutions(templateId, limit);
  return c.json({ executions });
});

export default app;