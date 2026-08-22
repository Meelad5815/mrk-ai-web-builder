import type { AgentPlan } from '@/types';
import { normalizeRepoPath } from '@/lib/utils/path-safety';

export function parseStructuredAgentOutput(raw: string): AgentPlan {
  const json = extractJson(raw);
  const parsed = JSON.parse(json) as AgentPlan;
  validateAgentPlan(parsed);
  return parsed;
}

function extractJson(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{')) return trimmed;
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (match?.[1]) return match[1].trim();
  throw new Error('Gemini did not return structured JSON.');
}

export function validateAgentPlan(plan: AgentPlan): asserts plan is AgentPlan {
  if (!plan || typeof plan.summary !== 'string' || !Array.isArray(plan.changes)) throw new Error('Invalid agent plan shape.');
  for (const change of plan.changes) {
    if (!['create', 'modify', 'delete'].includes(change.action)) throw new Error(`Invalid action for ${change.path}.`);
    if (!normalizeRepoPath(change.path)) throw new Error(`Unsafe path rejected: ${change.path}`);
    if (change.action !== 'delete' && typeof change.content !== 'string') throw new Error(`Missing content for ${change.path}.`);
  }
}
