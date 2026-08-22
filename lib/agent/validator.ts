import type { AgentPlan } from '@/types';
import { validateAgentPlan } from '@/lib/gemini/parser';

const destructiveExtensions = [/\.pem$/, /\.key$/, /\.p12$/];

export function validateSafeChangeSet(plan: AgentPlan) {
  validateAgentPlan(plan);
  const warnings = [...plan.warnings];
  for (const change of plan.changes) {
    if (change.action === 'delete') warnings.push(`Deletion requires explicit user approval: ${change.path}`);
    if (destructiveExtensions.some((pattern) => pattern.test(change.path))) throw new Error(`Secret-like file rejected: ${change.path}`);
    const content = change.content || '';
    if (/GITHUB_CLIENT_SECRET\s*=\s*['"][^'"]+['"]/.test(content) || /GEMINI_API_KEY\s*=\s*['"][^'"]+['"]/.test(content)) {
      throw new Error(`Potential hard-coded secret rejected: ${change.path}`);
    }
  }
  return { ...plan, warnings };
}
