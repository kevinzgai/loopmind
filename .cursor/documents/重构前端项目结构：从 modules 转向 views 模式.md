I will implement the "One-Click Agent Configuration Generation" feature by adding a new AI-powered endpoint and updating the frontend form.

### Backend Implementation

1. **Create New Endpoint**: `POST /api/agent/generate-config` in `agentRoutes.js`.
2. **Implement Controller Logic**:

   * Add `handleGenerateAgentConfig` in `agentController.js`.

   * This function will accept a user prompt (e.g., "A history teacher").

   * It will construct a strict system prompt instructing the AI to return a JSON object containing: `name`, `description`, `personality` (system prompt), `initialMemory` (greeting), `avatar` (emoji), and `voice` suggestion.

   * It will use `aiService.callAI` to generate the response and parse it into structured data.

### Frontend Implementation

1. **Update** **`agentService.js`**: Add `generateAgentConfig` method to call the new API.
2. **Enhance** **`AgentForm.vue`**:

   * Add a **"One-Click Generate" (✨ 一键生成)** button at the top of the form.

   * Create a simple input area (Modal or Collapsible Section) where you can describe the desired agent.

   * On confirmation, call the backend API and automatically fill the form fields (`Name`, `Description`, `Personality`, `Initial Memory`, `Avatar`) with the AI-generated content.

   * Add loading states to indicate the generation process.

### Verification

* I will verify that clicking the button and entering a description (e.g., "A strict math teacher") correctly populates the form with a relevant name, personality, and greeting.

