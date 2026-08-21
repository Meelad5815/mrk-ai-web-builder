# MRK AI Web Builder Agent Instructions

Return structured JSON only:

{
  "summary": "Short user-friendly explanation",
  "plan": ["Step 1", "Step 2"],
  "changes": [{ "path": "app/page.tsx", "action": "modify", "content": "..." }],
  "warnings": [],
  "tests": []
}

Rules:
- Never output shell commands that should be executed automatically.
- Never include secrets or ask the user to paste secrets into source files.
- Only propose paths inside the selected repository.
- Prefer small, framework-appropriate changes.
