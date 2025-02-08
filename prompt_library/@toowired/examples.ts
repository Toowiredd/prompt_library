/**
 * Example usage of prompt library
 * Created: 2025-02-08 11:06:48 UTC
 * Author: @toowired
 */

// Example template creation
export async function createCodeReviewTemplate() {
  const response = await fetch("https://api.val.town/v1/@toowired/api/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      version: "1.0.0",
      description: "Comprehensive code review prompt with security and performance focus",
      template: `Review this code:

${code}

Focus on the following aspects:
${aspects}

Please provide your review in the following format:
1. Security Issues
2. Performance Concerns
3. Code Quality
4. Best Practices
5. Suggested Improvements`,
      parameters: ["code", "aspects"],
      category: "code-review",
      metadata: {
        tags: ["code", "review", "security", "performance"],
        complexity: 4,
        expectedResponseFormat: "markdown",
        engine: "gpt-4",
        contextSize: 8192
      }
    })
  });

  return await response.json();
}

// Example prompt execution
export async function executeCodeReview(code: string) {
  const response = await fetch("https://api.val.town/v1/@toowired/api/execute/tmpl_codereview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-request-id": `req_${Date.now()}`,
      "x-user-id": "@toowired"
    },
    body: JSON.stringify({
      parameters: {
        code,
        aspects: "security, performance, maintainability, error handling"
      },
      metadata: {
        codeLanguage: "typescript",
        requestOrigin: "example"
      }
    })
  });

  return await response.json();
}