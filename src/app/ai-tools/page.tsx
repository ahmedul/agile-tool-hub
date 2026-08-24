import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import TrackedLink from "@/components/TrackedLink";
import { buildBreadcrumbSchema, buildCollectionPageSchema, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AI-Friendly Agile Tools Directory | AgileToolHub",
  description:
    "A clear directory of AgileToolHub's free Agile and Scrum tools, including inputs, outputs, and the best workflow for each tool.",
  keywords: [
    "AI agile tools",
    "Agile tools directory",
    "Scrum tools for AI agents",
    "free Agile tools",
    "planning poker tool",
    "story point calculator",
  ],
  canonical: "https://agiletoolhub.com/ai-tools",
});

const tools = [
  {
    name: "Planning Poker",
    purpose: "Estimate user stories with a distributed Agile team using simultaneous Fibonacci votes.",
    inputs: "A story title or description and a team session link.",
    outputs: "Revealed votes, discussion context, and a final story point estimate.",
    href: "/tools/planning-poker",
  },
  {
    name: "Story Point Calculator",
    purpose: "Create a quick Fibonacci estimate for one user story.",
    inputs: "A story summary plus effort, complexity, uncertainty, risk, and dependency ratings.",
    outputs: "A recommended story point value, confidence level, sizing factors, and next actions.",
    href: "/tools/story-point-calculator",
  },
  {
    name: "User Story Generator",
    purpose: "Turn a feature idea into a Jira-ready user story.",
    inputs: "A feature idea, user context, and desired outcome.",
    outputs: "A structured user story with acceptance criteria and implementation context.",
    href: "/tools/user-story-generator",
  },
  {
    name: "Acceptance Criteria Generator",
    purpose: "Create testable acceptance criteria for a user story.",
    inputs: "A story or feature description and a preferred Given/When/Then or checklist format.",
    outputs: "Structured acceptance criteria that can be reviewed or pasted into Jira.",
    href: "/tools/acceptance-criteria-generator",
  },
  {
    name: "Bug Report to Jira Ticket Converter",
    purpose: "Convert rough bug notes into a clear Jira ticket.",
    inputs: "Bug symptoms, reproduction steps, expected behavior, and environment details.",
    outputs: "A structured bug report with summary, steps, impact, and useful Jira fields.",
    href: "/tools/bug-report-to-jira-ticket-converter",
  },
  {
    name: "Sprint Capacity Calculator",
    purpose: "Estimate realistic sprint commitment from team availability.",
    inputs: "Team size, working days, availability, and historical velocity or points per day.",
    outputs: "Maximum and recommended sprint capacity in story points.",
    href: "/tools/sprint-capacity-calculator",
  },
  {
    name: "Daily Standup Generator",
    purpose: "Turn rough team notes into a concise standup update.",
    inputs: "Yesterday, today, blockers, and sprint goal context.",
    outputs: "A clear update suitable for Slack, Jira, or a team chat.",
    href: "/tools/daily-standup-generator",
  },
  {
    name: "Retrospective Board",
    purpose: "Run a live retrospective with shared notes and action items.",
    inputs: "A team session and notes for what went well, what to improve, and actions.",
    outputs: "A collaborative retro board with grouped feedback and follow-up actions.",
    href: "/tools/retro-board",
  },
];

export default function AIToolsPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "AI Tools Directory", href: "/ai-tools" },
  ]);
  const collectionSchema = buildCollectionPageSchema({
    name: "AI-Friendly Agile Tools Directory",
    description: "Structured directory of free AgileToolHub tools with purposes, inputs, outputs, and workflow links.",
    url: "https://agiletoolhub.com/ai-tools",
    items: tools.map((tool) => ({
      name: tool.name,
      description: tool.purpose,
      url: `https://agiletoolhub.com${tool.href}`,
    })),
  });

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: "AI Tools Directory" }]} />
        <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Machine-readable directory</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
          Agile and Scrum tools by workflow
        </h1>
        <p className="max-w-3xl text-lg text-gray-600 mb-10">
          Use this directory to find the right free AgileToolHub tool for a team workflow. Each entry states what the tool does, what it accepts, and what it produces.
        </p>

        <section className="mb-10 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Use AI to prepare, then let the team decide</h2>
          <p className="mt-2 max-w-3xl text-gray-700">
            AI can help draft stories, find missing acceptance criteria, prepare estimation questions, and summarize team notes. Use the dedicated tool to review the result, collaborate, and record the team decision.
          </p>
          <TrackedLink
            href="/guides/ai-assisted-agile-tools-for-scrum-teams"
            label="Read the AI-assisted Agile workflow guide"
            eventParams={{ surface: "ai_tools_directory", placement: "ai_workflow_guide" }}
            className="mt-3 inline-block text-blue-700 font-medium hover:underline"
          >
            Read the AI-assisted Agile workflow guide →
          </TrackedLink>
        </section>

        <section className="mb-10 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-semibold text-gray-900">For software agents</h2>
          <p className="mt-2 text-gray-700">
            Read the <TrackedLink
              href="/docs/ai-agent-tools"
              label="AI agent tools documentation"
              eventParams={{ surface: "ai_tools_directory", placement: "agent_docs" }}
              className="text-blue-700 hover:underline"
            >AI agent tools documentation</TrackedLink>, then use the public <TrackedLink
              href="/openapi.json"
              label="OpenAPI specification"
              eventParams={{ surface: "ai_tools_directory", placement: "openapi" }}
              className="text-blue-700 hover:underline"
            >OpenAPI specification</TrackedLink> to call the deterministic Story Point Estimator and Sprint Capacity Calculator with JSON input and receive structured JSON output.
          </p>
          <div className="mt-4 rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <p className="font-semibold text-gray-900">Connect through MCP</p>
            <p className="mt-1">MCP-capable clients can discover these tools at <code className="rounded bg-gray-100 px-1.5 py-0.5">https://agiletoolhub.com/mcp</code>.</p>
            <TrackedLink
              href="/docs/ai-agent-tools#mcp"
              label="View MCP connection instructions"
              eventParams={{ surface: "ai_tools_directory", placement: "mcp" }}
              className="mt-2 inline-block text-blue-700 font-medium hover:underline"
            >
              View MCP connection instructions →
            </TrackedLink>
          </div>
        </section>

        <div className="space-y-5">
          {tools.map((tool) => (
            <article key={tool.href} className="border border-gray-200 rounded-lg p-6 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">
                <TrackedLink
                  href={tool.href}
                  label={tool.name}
                  eventParams={{ surface: "ai_tools_directory", placement: "tool_card" }}
                  className="text-blue-700 hover:underline"
                >{tool.name}</TrackedLink>
              </h2>
              <p className="mt-2 text-gray-700">{tool.purpose}</p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="font-semibold text-gray-900">Inputs</dt>
                  <dd className="mt-1 text-gray-600">{tool.inputs}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Outputs</dt>
                  <dd className="mt-1 text-gray-600">{tool.outputs}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <p className="mt-10 text-gray-600">
          See the full <TrackedLink href="/tools" label="Agile tools hub" eventParams={{ surface: "ai_tools_directory", placement: "footer" }} className="text-blue-600 hover:underline">Agile tools hub</TrackedLink> for workflow groups, guides, templates, and FAQs, or read the <TrackedLink href="/guides/ai-assisted-agile-tools-for-scrum-teams" label="AI-assisted Agile guide" eventParams={{ surface: "ai_tools_directory", placement: "footer" }} className="text-blue-600 hover:underline">AI-assisted Agile guide</TrackedLink> for safe human-in-the-loop workflows.
        </p>
      </main>
    </>
  );
}
