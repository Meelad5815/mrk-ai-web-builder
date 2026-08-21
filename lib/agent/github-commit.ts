import { PublicError } from '@/lib/utils/errors';
import type { AgentPlan } from '@/types';

export function createFeatureBranchName(date = new Date()) {
  return `feature/ai-change-${date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'z')}`;
}

export async function createCommitFromPlan(_input: { accessToken: string; owner: string; repo: string; baseBranch: string; plan: AgentPlan; message: string }) {
  // The tree/write implementation is intentionally centralized here. The UI/API requires user approval before calling this function.
  // A production deployment can replace this placeholder with GitHub Git Data API calls without changing the agent contract.
  throw new PublicError('GitHub commit writing is prepared but disabled until repository write approval is connected.', 501);
}
