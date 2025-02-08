/**
 * Prompt execution engine
 * Created: 2025-02-08 11:06:48 UTC
 * Author: @toowired
 */

import { OpenAI } from "npm:openai";
import { 
  PromptTemplate,
  PromptExecutionContext,
  PromptExecutionResult,
  ExecutionContextSchema
} from "https://esm.town/v/@toowired/types";
import { 
  getTemplate,
  logExecution 
} from "https://esm.town/v/@toowired/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function processTemplate(
  template: PromptTemplate,
  parameters: Record<string, unknown>
): Promise<string> {
  let processedTemplate = template.template;
  
  for (const [key, value] of Object.entries(parameters)) {
    if (!template.parameters.includes(key)) {
      throw new Error(`Unknown parameter: ${key}`);
    }
    processedTemplate = processedTemplate.replace(
      `\${${key}}`,
      String(value)
    );
  }

  return processedTemplate;
}

export async function executePrompt(
  context: PromptExecutionContext
): Promise<PromptExecutionResult> {
  const startTime = Date.now();
  const executionId = `exec_${context.requestId}_${Date.now()}`;

  try {
    // Validate context
    await ExecutionContextSchema.parseAsync(context);

    // Fetch template
    const template = await getTemplate(context.templateId);
    if (!template) {
      throw new Error(`Template ${context.templateId} not found`);
    }

    // Process template
    const promptText = await processTemplate(template, context.parameters);

    // Execute prompt
    const completion = await openai.chat.completions.create({
      model: template.metadata.engine || 'gpt-4',
      messages: [{ role: "user", content: promptText }],
      user: context.userId,
    });

    const result: PromptExecutionResult = {
      id: executionId,
      templateId: context.templateId,
      input: context.parameters,
      output: completion.choices[0].message.content,
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime,
      success: true,
      metadata: {
        modelVersion: completion.model,
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
        processingSteps: ["validation", "template_fetch", "processing", "execution"],
      },
    };

    // Log execution
    await logExecution(result);
    return result;

  } catch (error) {
    const result: PromptExecutionResult = {
      id: executionId,
      templateId: context.templateId,
      input: context.parameters,
      output: null,
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime,
      success: false,
      error: {
        code: error.code || "EXECUTION_ERROR",
        message: error.message,
        details: error,
      },
      metadata: {
        processingSteps: ["error"],
      },
    };

    await logExecution(result);
    return result;
  }
}