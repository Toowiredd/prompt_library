export const CONFIG = {
  valtown: {
    namespace: "@toowired",
    apiKeyEnv: "VAL_TOWN_API_KEY",
    privacy: "public"
  },
  initialization: {
    files: [
      "prompt-types.json",
      "prompt-store.json",
      "prompt-executor.json",
      "prompt-api.json",
      "prompt-sync.json",
      "prompt-cache.json",
      "prompt-suggestions.json",
      "prompt-testing.json",
      "prompt-docs.json",
      "prompt-workflows.json",
      "prompt-search.json",
      "prompt-optimizer.json"
    ],
    order: {
      "prompt-types.json": 1,
      "prompt-store.json": 2,
      "prompt-executor.json": 3,
      "prompt-api.json": 4
    }
  }
}