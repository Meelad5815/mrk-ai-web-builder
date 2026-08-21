import { createReadableDiff } from '@/lib/agent/diff';
import { validateSafeChangeSet } from '@/lib/agent/validator';
import { generateCodeChange } from '@/lib/gemini/client';
import type { AgentWorkflowStep, ProjectInspection } from '@/types';

export async function runAgentPlanning(input: { request: string; inspection: ProjectInspection; files: Array<{ path: string; content: string }> }) {
  const steps: AgentWorkflowStep[] = ['understand', 'inspect', 'plan', 'generate', 'validate', 'review'];
  const generated = await generateCodeChange(input);
  const safePlan = validateSafeChangeSet(generated);
  return { steps, plan: safePlan, diffs: safePlan.changes.map(createReadableDiff) };
}
