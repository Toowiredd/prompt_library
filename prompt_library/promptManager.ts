// HTTP val for managing prompts
// @ts-expect-error Val Town import
import { createTemplate, listTemplates } from "https://esm.town/v/@username/promptLibrary";
// @ts-expect-error Val Town import
import { executePrompt } from "https://esm.town/v/@username/promptExecutor";
import { Hono } from "npm:hono";

const app = new Hono();

// List all templates or by category
app.get("/templates/:category?", async (c) => {
  const category = c.param("category");
  const templates = await listTemplates(category);
  return c.json(templates);
});

// Create a new template
app.post("/templates", async (c) => {
  const template = await c.req.json();
  const id = await createTemplate(template);
  return c.json({ id });
});

// Execute a prompt
app.post("/execute/:templateId", async (c) => {
  const templateId = c.param("templateId");
  const parameters = await c.req.json();
  const result = await executePrompt(templateId, parameters);
  return c.json(result);
});

export default app;