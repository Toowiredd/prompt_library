/**
 * Prompt execution engine
 * Created: 2025-02-08 11:05:26 UTC
 * Author: @toowiredd
 */

import { OpenAI } from "npm:openai";
import { 
  PromptTemplate,
  PromptExecutionContext,
  PromptExecutionResult,
  ExecutionContextSchema
} from "https://esm.town/v/@toowiredd/types";
import { 
  getTemplate,
  logExecution 
} from "https://esm.town/v/@toowiredd/db";

// Initialize OpenAI client
const openai = new OpenA