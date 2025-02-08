/**
 * Main Application Component
 * Created: 2025-02-08 11:08:42 UTC
 * Author: @toowired
 */

import { createSignal, Show, For } from 'npm:solid-js';
import { styled } from 'npm:solid-styled-components';
import { PromptTemplate, PromptExecutionResult } from '../types';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #f5f5f5;
`;

const Sidebar = styled.div`
  width: 250px;
  background: #fff;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  padding: 1rem;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const Button = styled.button`
  background: #2196f3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: #1976d2;
  }
`;

export function App() {
  const [templates, setTemplates] = createSignal<PromptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = createSignal<PromptTemplate | null>(null);
  const [executionResult, setExecutionResult] = createSignal<PromptExecutionResult | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  async function fetchTemplates() {
    try {
      const response = await fetch('https://api.val.town/v1/@toowired/api/templates');
      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }

  async function executePrompt(templateId: string, parameters: Record<string, unknown>) {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.val.town/v1/@toowired/api/execute/${templateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': `req_${Date.now()}`,
          'x-user-id': '@toowired'
        },
        body: JSON.stringify({ parameters })
      });
      const result = await response.json();
      setExecutionResult(result);
    } catch (error) {
      console.error('Error executing prompt:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppContainer>
      <Sidebar>
        <h2>Prompt Templates</h2>
        <For each={templates()}>
          {(template) => (
            <Card onClick={() => setSelectedTemplate(template)}>
              <h3>{template.description}</h3>
              <p>Category: {template.category}</p>
            </Card>
          )}
        </For>
        <Button onClick={fetchTemplates}>Refresh Templates</Button>
      </Sidebar>

      <MainContent>
        <Show when={selectedTemplate()} fallback={<h2>Select a template to start</h2>}>
          {(template) => (
            <Card>
              <h2>{template.description}</h2>
              <p>Version: {template.version}</p>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const parameters = {};
                template.parameters.forEach(param => {
                  parameters[param] = formData.get(param);
                });
                executePrompt(template.id, parameters);
              }}>
                <For each={template.parameters}>
                  {(param) => (
                    <div>
                      <label>{param}:</label>
                      <input name={param} required />
                    </div>
                  )}
                </For>
                <Button type="submit" disabled={isLoading()}>
                  {isLoading() ? 'Executing...' : 'Execute Prompt'}
                </Button>
              </form>
            </Card>
          )}
        </Show>

        <Show when={executionResult()}>
          {(result) => (
            <Card>
              <h3>Execution Result</h3>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </Card>
          )}
        </Show>
      </MainContent>
    </AppContainer>
  );
}