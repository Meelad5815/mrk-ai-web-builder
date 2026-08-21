import { PublicError } from '@/lib/utils/errors';
import { parseStructuredAgentOutput } from '@/lib/gemini/parser';
import type { AgentPlan, ProjectInspection } from '@/types';

export async function generateCodeChange(input: { request: string; inspection: ProjectInspection; files: Array<{ path: string; content: string }> }): Promise<AgentPlan> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new PublicError('Gemini is not configured yet. Add GEMINI_API_KEY on the server.', 503);
  const prompt = buildPrompt(input);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } }),
  });
  if (!response.ok) throw new PublicError('Gemini could not generate changes. Please try again.', 502);
  const payload = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new PublicError('Gemini returned an empty response.', 502);
  return parseStructuredAgentOutput(text);
}

function buildPrompt(input: { request: string; inspection: ProjectInspection; files: Array<{ path: string; content: string }> }) {
  return `You are MRK AI Web Builder. Return ONLY valid JSON with keys summary, plan, changes, warnings, tests.
Never include shell commands to execute. Never request secret values. Use create|modify|delete actions only.
User request: ${input.request}
Project type: ${input.inspection.projectType}
Dependencies: ${JSON.stringify(input.inspection.dependencies)}
Important files: ${input.inspection.importantFiles.join(', ')}
Relevant file contents: ${JSON.stringify(input.files)}`;
}
