// @ts-expect-error Val Town import
import { getTemplate } from "https://esm.town/v/@username/promptLibrary";
import { OpenAI } from "npm:openai";

export async function executePrompt(
  templateId: string, 
  parameters: Record<string, any>
): Promise<PromptExecutionResult> {
  const startTime = Date.now();
  
  try {
    const template = await getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Validate parameters
    for (const required of template.parameters) {
      if (!(required in parameters)) {
        throw new Error(`Missing required parameter: ${required}`);
      }
    }

    // Replace parameters in template
    let promptText = template.template;
    for (const [key, value] of Object.entries(parameters)) {
      promptText = promptText.replace(`\${${key}}`, String(value));
    }

    // Execute prompt using OpenAI
    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: promptText }],
      model: "gpt-4",
    });

    return {
      templateId,
      input: parameters,
      output: completion.choices[0].message.content,
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime,
      success: true,
    };
  } catch (error) {
    return {
      templateId,
      input: parameters,
      output: null,
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime,
      success: false,
      error: error.message,
    };
  }
}