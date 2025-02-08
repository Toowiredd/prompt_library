/**
 * Prompt execution engine
 * Last Updated: 2025-02-08 11:02:29
 * @author Toowiredd
 */

import { OpenAI } from "npm:openai";
import { PromptDatabase } from "./database";
import { 
  type PromptExecutionContext,
  type PromptExecutionResult,
  type PromptTemplate,
  PromptTemplateSchema 
} from "./types";

export class PromptExecutor {
  private openai: OpenAI;
  
  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  private async validateTemplate(template: PromptTemplate) {
    try {
      await PromptTemplateSchema.parseAsync(template);
      return true;
    } catch (error) {
      console.error("Template validation failed:", error);
      return false;
    }
  }

  private async processTemplate(
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

  async execute(
    context: PromptExecutionContext
  ): Promise<PromptExecutionResult> {
    const startTime = Date.now();
    const executionId = `exec_${context.requestId}_${Date.now()}`;

    try {
      // Fetch template
      const template = await PromptDatabase.getTemplate(context.templateId);
      if (!template) {
        throw new Error(`Template ${context.templateId} not found`);
      }

      // Validate template
      const isValid = await this.validateTemplate(template);
      if (!isValid) {
        throw new Error("Template validation failed");
      }

      // Process template
      const promptText = await this.processTemplate(
        template, 
        context.parameters
      );

      // Execute prompt
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
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
          processingSteps: ["template_fetch", "validation", "processing", "execution"],
        },
      };

      // Log execution
      await PromptDatabase.logExecution(result);

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
          details: error.details,
        },
        metadata: {
          processingSteps: ["template_fetch", "error"],
        },
      };

      // Log failed execution
      await PromptDatabase.logExecution(result);

      return result;
    }
  }
}