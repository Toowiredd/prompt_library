/**
 * Shared types for the prompt library system
 * Created: 2025-02-08 11:05:26 UTC
 * Author: @toowiredd
 */

import { z } from "npm:zod";

// Schema for prompt templates with strict validation
export const PromptTemplateSchema = z.object({
  id: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().min(10),
  template: z.string().min(1),
  parameters: z.array(z.string()),
  category: z.string(),
  author: z.string(),
  lastUpdated: z.string().datetime(),
  metadata: z.object({
    tags: z.array(z.string()),
    complexity: z.number().int().min(1).max(10),
    expectedResponseFormat: z.string(),
    requiredApiVersion: z.string().optional(),
    contextSize: z.number().optional(),
    engine: z.enum(['gpt-4', 'gpt-3.5-turbo']).default('gpt-4'),
  }).strict(),
});

export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;

export const ExecutionContextSchema = z.object({
  templateId: z.string(),
  parameters: z.record(z.unknown()),
  timestamp: z.string().datetime(),
  requestId: z.string(),
  userId: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export type PromptExecutionContext = z.infer<typeof ExecutionContextSchema>;

export const ExecutionResultSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  input: z.record(z.unknown()),
  output: z.unknown(),
  timestamp: z.string().datetime(),
  executionTime: z.number(),
  success: z.boolean(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }).optional(),
  metadata: z.object({
    modelVersion: z.string().optional(),
    promptTokens: z.number().optional(),
    completionTokens: z.number().optional(),
    totalTokens: z.number().optional(),
    processingSteps: z.array(z.string()).optional(),
  }),
});

export type PromptExecutionResult = z.infer<typeof ExecutionResultSchema>;