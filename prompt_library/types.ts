/**
 * Core types for the prompt library system
 * Last Updated: 2025-02-08 11:02:29
 * @author Toowiredd
 */

import { z } from "npm:zod";

// Zod schema for type validation
export const PromptTemplateSchema = z.object({
  id: z.string().optional(),
  version: z.string(),
  description: z.string(),
  template: z.string(),
  parameters: z.array(z.string()),
  category: z.string(),
  author: z.string(),
  lastUpdated: z.string().datetime(),
  metadata: z.object({
    tags: z.array(z.string()),
    complexity: z.number().min(1).max(10),
    expectedResponseFormat: z.string(),
    requiredApiVersion: z.string().optional(),
    contextSize: z.number().optional(),
  }),
});

// Type inference from Zod schema
export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;

export interface PromptExecutionContext {
  templateId: string;
  parameters: Record<string, unknown>;
  timestamp: string;
  requestId: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

export interface PromptExecutionResult {
  id: string;
  templateId: string;
  input: Record<string, unknown>;
  output: unknown;
  timestamp: string;
  executionTime: number;
  success: boolean;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata: {
    modelVersion?: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    processingSteps?: string[];
  };
}

export type ValidationResult = {
  valid: boolean;
  errors?: string[];
};