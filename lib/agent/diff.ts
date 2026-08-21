import type { AgentChange } from '@/types';

export function createReadableDiff(change: AgentChange) {
  if (change.action === 'create') return `+++ ${change.path}\n${prefixLines(change.content || '', '+')}`;
  if (change.action === 'delete') return `--- ${change.path}\n${prefixLines(change.previousContent || '', '-')}`;
  return `--- ${change.path}\n+++ ${change.path}\n${prefixLines(change.previousContent || '', '-')}\n${prefixLines(change.content || '', '+')}`;
}

function prefixLines(content: string, prefix: '+' | '-') {
  return content.split('\n').map((line) => `${prefix}${line}`).join('\n');
}
