// Incident-specific templates need an explicit incident context. Short location
// fragments such as "ams" also occur in ordinary words such as "teams".
export function isIncidentContext(input: string): boolean {
  return /\b(?:outage|incident|degradation|vprn)\b|\bservice\s+placement\b|\bdesire\s*db\b|\bedge\d+\./i.test(input);
}

export function splitBugNotes(input: string): string[] {
  return input
    .replace(/\s+(?=(?:steps(?:\s+to\s+reproduce)?|expected(?:\s+result)?|actual(?:\s+result)?|observed|environment)\s*:)/gi, "\n")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
}

export function splitStoryNotes(input: string): string[] {
  return input.replace(/([.!?])\s+(?=[A-Z])/g, "$1\n").split("\n").map(line => line.trim()).filter(Boolean);
}

export function extractScopeExclusions(input: string): string[] {
  return splitStoryNotes(input)
    .filter(line => /\b(?:out of scope|not included|excluded|not part of|do not include|must not include)\b/i.test(line))
    .slice(0, 4)
    .map(line => line.replace(/^[-*]\s*/, ""));
}

export function extractStoryIntent(input: string, userType: string, fallbackGoal: string) {
  const naturalStatement = input.match(/^\s*(?:the\s+)?(shopper|customer|user|administrator|operator|developer|team member)\s+can\s+([^.;\n]+)/i);
  const user = input.match(/\bas an?\s+([^,.;\n]+)/i)?.[1]
    ?? input.match(/\bfor\s+([^,.;\n]+?)\s+(?:to|who|when)/i)?.[1]
    ?? (userType.trim() || naturalStatement?.[1]?.toLowerCase() || "user");
  const goal = input.match(/\bi want to\s+(.+?)(?=,?\s+(?:so that|because)\b|[.;\n]|$)/i)?.[1]
    ?? input.match(/\bneed to\s+(.+?)(?=,?\s+(?:so that|because)\b|[.;\n]|$)/i)?.[1]
    ?? input.match(/\bshould be able to\s+(.+?)(?=,?\s+(?:so that|because)\b|[.;\n]|$)/i)?.[1]
    ?? naturalStatement?.[2]
    ?? fallbackGoal;
  const benefit = input.match(/\bso that\s+([^.;\n]+)/i)?.[1]
    ?? input.match(/\bbecause\s+([^.;\n]+)/i)?.[1]
    ?? "the user can complete the job faster with fewer errors";
  return { user: user.trim(), goal: goal.replace(/,?\s+(?:so that|because)\b.*$/i, "").trim(), benefit: benefit.trim() };
}
