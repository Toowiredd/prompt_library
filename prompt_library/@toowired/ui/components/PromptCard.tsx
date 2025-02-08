/**
 * Enhanced Prompt Card Component
 * Created: 2025-02-08 11:11:14 UTC
 * Author: @toowired
 */

import { createSignal, Show } from 'npm:solid-js';
import { styled } from 'npm:solid-styled-components';
import { Motion } from 'npm:@motionone/solid';

const Card = styled(Motion.div)`
  background: var(--surface-1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const Tags = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: var(--surface-2);
  color: var(--text-2);
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
`;

const Complexity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  color: var(--text-2);
`;

const ComplexityDot = styled.span<{ active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.active ? 'var(--primary)' : 'var(--surface-3)'};
`;

const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--text-2);
`;

export function PromptCard({ template, onClick }) {
  const [isHovered, setIsHovered] = createSignal(false);

  const renderComplexity = (level: number) => (
    <Complexity>
      {Array.from({ length: 5 }).map((_, i) => (
        <ComplexityDot active={i < level} />
      ))}
      <span>Complexity {level}/5</span>
    </Complexity>
  );

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      animate={{
        scale: isHovered() ? 1.02 : 1
      }}
    >
      <h3>{template.description}</h3>
      <Tags>
        {template.metadata.tags.map(tag => (
          <Tag>{tag}</Tag>
        ))}
      </Tags>
      {renderComplexity(template.metadata.complexity)}
      <MetaInfo>
        <span>Version {template.version}</span>
        <span>By {template.author}</span>
      </MetaInfo>
    </Card>
  );
}