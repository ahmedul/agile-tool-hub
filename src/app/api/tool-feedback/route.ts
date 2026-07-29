import { NextResponse } from "next/server";

type FeedbackType = "issue" | "feature";

interface ToolFeedbackRequest {
  toolName?: unknown;
  toolSlug?: unknown;
  feedbackType?: unknown;
  message?: unknown;
}

const FEEDBACK_TYPES = ["issue", "feature"] as const;
const DEFAULT_REPO = "ahmedul/agile-tool-hub";
const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const TOOL_SLUG_PATTERN = /^[a-z0-9-]{2,80}$/;

function isFeedbackType(value: unknown): value is FeedbackType {
  return typeof value === "string" && (FEEDBACK_TYPES as readonly string[]).includes(value);
}

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().slice(0, maxLength);
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return process.env.NODE_ENV !== "production";

  try {
    const hostname = new URL(origin).hostname;
    return ["agiletoolhub.com", "www.agiletoolhub.com", "localhost", "127.0.0.1"].includes(hostname);
  } catch {
    return false;
  }
}

function feedbackRepo(): string {
  const repo = process.env.GITHUB_FEEDBACK_REPO?.trim();
  return repo && REPO_PATTERN.test(repo) ? repo : DEFAULT_REPO;
}

function githubIssueUrl(repo: string, title: string, body: string): string {
  const params = new URLSearchParams({ title, body });
  return `https://github.com/${repo}/issues/new?${params.toString()}`;
}

function feedbackLabel(type: FeedbackType): string {
  return type === "feature" ? "Feature request" : "Bug or confusing result";
}

function buildIssueTitle(toolName: string, type: FeedbackType): string {
  return `${feedbackLabel(type)}: ${toolName}`;
}

function buildIssueBody({
  toolName,
  toolSlug,
  feedbackType,
  message,
}: {
  toolName: string;
  toolSlug: string;
  feedbackType: FeedbackType;
  message: string;
}): string {
  return [
    "## Feedback",
    "",
    `- Tool: ${toolName}`,
    `- Page: https://agiletoolhub.com/tools/${toolSlug}`,
    `- Type: ${feedbackLabel(feedbackType)}`,
    `- Submitted: ${new Date().toISOString()}`,
    "",
    "## Details",
    "",
    message,
  ].join("\n");
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request.headers.get("origin"))) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body: ToolFeedbackRequest;
  try {
    body = (await request.json()) as ToolFeedbackRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const toolName = cleanText(body.toolName, 100);
  const toolSlug = cleanText(body.toolSlug, 80);
  const feedbackType = body.feedbackType;
  const message = cleanText(body.message, 1200);

  if (!toolName) {
    return NextResponse.json({ error: "Missing required field: toolName." }, { status: 400 });
  }

  if (!TOOL_SLUG_PATTERN.test(toolSlug)) {
    return NextResponse.json({ error: "Invalid toolSlug." }, { status: 400 });
  }

  if (!isFeedbackType(feedbackType)) {
    return NextResponse.json({ error: "Invalid feedbackType." }, { status: 400 });
  }

  if (message.length < 10) {
    return NextResponse.json(
      { error: "Detailed feedback must include at least 10 characters." },
      { status: 400 },
    );
  }

  const title = buildIssueTitle(toolName, feedbackType);
  const issueBody = buildIssueBody({ toolName, toolSlug, feedbackType, message });
  const repo = feedbackRepo();
  const fallbackUrl = githubIssueUrl(repo, title, issueBody);
  const token = process.env.GITHUB_FEEDBACK_TOKEN || process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "Feedback storage is not configured.", fallbackUrl },
      { status: 501 },
    );
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        title,
        body: issueBody,
      }),
    });

    if (!response.ok) {
      await response.text();
      return NextResponse.json(
        { error: `GitHub issue creation failed (${response.status}).`, fallbackUrl },
        { status: 502 },
      );
    }

    const data = (await response.json()) as { html_url?: string };
    return NextResponse.json({ issueUrl: data.html_url || fallbackUrl });
  } catch {
    return NextResponse.json(
      { error: "Feedback submission failed.", fallbackUrl },
      { status: 500 },
    );
  }
}
