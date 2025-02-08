/**
 * HTTP API endpoints for prompt library
 * Created: 2025-02-08 11:06:48 UTC
 * Author: @toowired
 */

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { 
  PromptTemplateSchema,
  ExecutionContextSchema 
} from "https://esm.town/v/@toowired/types";
import { 
  createTemplate,
  getTemplate,
  getExecutionHistory 
} from "https://esm.town/v/@toowired/db";
import { executePrompt } from "https://esm.town/v/@toowired/executor";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", async (c, next) => {
  const startTime = Date.now();
  await next();
  c.header('X-Response-Time', `${Date.now() - startTime}ms`);
});

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

// Create new template
app.post("/templates", async (c) => {
  const body = await c.req.json();
  
  try {
    const template = await PromptTemplateSchema.parseAsync({
      ...body,
      author: body.author || "@toowired",
      lastUpdated: new Date().toISOString(),
    });

    const id = await createTemplate(template);
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

// Get template
app.get("/templates/:id", async (c) => {
  const id = c.param("id");
  const template = await getTemplate(id);
  
  if (!template) {
    return c.json({
      error: {
        code: "NOT_FOUND",
        message: `Template ${id} not found`,
      },
    }, 404);
  }

  return c.json(template);
});

// Execute prompt
app.post("/execute/:templateId", async (c) => {
  const templateId = c.param("templateId");
  const body = await c.req.json();
  
  const context = {
    templateId,
    parameters: body.parameters,
    timestamp: new Date().toISOString(),
    requestId: c.req.headers.get("x-request-id") || `req_${Date.now()}`,
    userId: c.req.headers.get("x-user-id") || "anonymous",
    metadata: body.metadata,
  };

  const result = await executePrompt(context);
  return c.json(result);
});

// Get execution history
app.get("/executions/:templateId", async (c) => {
  const templateId = c.param("templateId");
  const limit = parseInt(c.query("limit") || "10");
  
  const executions = await getExecutionHistory(templateId, limit);
  return c.json({ executions });
});

export default app;