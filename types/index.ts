export type RepositorySummary = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  defaultBranch: string;
  updatedAt: string;
  htmlUrl: string;
};

export type ProjectInspection = {
  projectType: string;
  importantFiles: string[];
  dependencies: Record<string, string>;
  notes: string[];
};

export type AgentChangeAction = 'create' | 'modify' | 'delete';

export type AgentChange = {
  path: string;
  action: AgentChangeAction;
  content?: string;
  previousContent?: string;
};

export type AgentPlan = {
  summary: string;
  plan: string[];
  changes: AgentChange[];
  warnings: string[];
  tests: string[];
};

export type AgentWorkflowStep =
  | 'understand'
  | 'inspect'
  | 'plan'
  | 'generate'
  | 'validate'
  | 'review'
  | 'approval'
  | 'apply'
  | 'commit'
  | 'preview';
