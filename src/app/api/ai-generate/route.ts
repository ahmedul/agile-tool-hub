import { NextResponse } from "next/server";

type ToolType = "bug-report" | "user-story" | "acceptance-criteria";

interface AiGenerateRequest {
  tool: ToolType;
  input: string;
  options?: {
    storyType?: "feature" | "improvement" | "task";
    priority?: "High" | "Medium" | "Low";
    format?: "gherkin" | "checklist" | "both";
    userType?: string;
  };
}

function buildSystemPrompt(tool: ToolType): string {
  if (tool === "bug-report") {
    return [
      "You convert messy chat transcripts into production-grade Jira bug tickets.",
      "Return ONLY markdown.",
      "Use this exact section order:",
      "## Title",
      "## Issue Type",
      "## Priority",
      "## Description",
      "## Steps to Reproduce",
      "## Expected Result",
      "## Actual Result",
      "## Environment",
      "## Acceptance Criteria",
      "Be specific, concise, and remove conversational noise.",
      "If details are missing, add [Needs confirmation] placeholders.",
    ].join("\n");
  }

  if (tool === "user-story") {
    return [
      "You convert product notes and chat transcripts into strong Jira user stories.",
      "Return ONLY markdown.",
      "Use this exact section order:",
      "## Title",
      "## Issue Type",
      "## Priority",
      "## User Story",
      "## Story Points",
      "## Acceptance Criteria",
      "## Out of Scope",
      "## Dependencies",
      "## Notes",
      "Acceptance criteria must be concrete and testable.",
      "If details are missing, add [Needs confirmation] placeholders.",
    ].join("\n");
  }

  return [
    "You convert feature notes and chats into high-quality acceptance criteria.",
    "Return ONLY markdown.",
    "If format is gherkin: return Given/When/Then criteria only.",
    "If format is checklist: return checklist criteria only.",
    "If format is both: return both sections separated by a horizontal rule.",
    "Criteria must be testable and include happy path, validation, and error handling.",
    "If details are missing, add [Needs confirmation] placeholders.",
  ].join("\n");
}

function buildUserPrompt(payload: AiGenerateRequest): string {
  return JSON.stringify(payload, null, 2);
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI mode is unavailable because OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  let body: AiGenerateRequest;
  try {
    body = (await request.json()) as AiGenerateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body?.tool || !body?.input) {
    return NextResponse.json({ error: "Missing required fields: tool and input." }, { status: 400 });
  }

  if (!(["bug-report", "user-story", "acceptance-criteria"] as const).includes(body.tool)) {
    return NextResponse.json({ error: "Invalid tool type." }, { status: 400 });
  }

  const input = body.input.trim();
  if (!input) {
    return NextResponse.json({ error: "Input cannot be empty." }, { status: 400 });
  }

  if (input.length > 12000) {
    return NextResponse.json({ error: "Input is too long. Please keep it under 12,000 characters." }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: buildSystemPrompt(body.tool) },
          { role: "user", content: buildUserPrompt(body) },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `AI provider error (${response.status}): ${errText}` },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const output = data.choices?.[0]?.message?.content?.trim();
    if (!output) {
      return NextResponse.json({ error: "AI response was empty." }, { status: 502 });
    }

    return NextResponse.json({ output });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to generate AI output: ${message}` }, { status: 500 });
  }
}
