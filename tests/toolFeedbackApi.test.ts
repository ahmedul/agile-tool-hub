import { POST } from "@/app/api/tool-feedback/route";

const validPayload = {
  toolName: "Sprint Capacity Calculator",
  toolSlug: "sprint-capacity-calculator",
  feedbackType: "feature",
  message: "I would like to switch velocity between points per day and points per week.",
};

function request(payload: unknown, origin = "https://agiletoolhub.com") {
  return new Request("https://agiletoolhub.com/api/tool-feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify(payload),
  });
}

describe("tool feedback API", () => {
  const originalToken = process.env.GITHUB_FEEDBACK_TOKEN;
  const originalRepo = process.env.GITHUB_FEEDBACK_REPO;
  const originalGithubToken = process.env.GITHUB_TOKEN;

  beforeEach(() => {
    delete process.env.GITHUB_FEEDBACK_TOKEN;
    delete process.env.GITHUB_FEEDBACK_REPO;
    delete process.env.GITHUB_TOKEN;
    vi.restoreAllMocks();
  });

  afterAll(() => {
    if (originalToken) process.env.GITHUB_FEEDBACK_TOKEN = originalToken;
    else delete process.env.GITHUB_FEEDBACK_TOKEN;

    if (originalRepo) process.env.GITHUB_FEEDBACK_REPO = originalRepo;
    else delete process.env.GITHUB_FEEDBACK_REPO;

    if (originalGithubToken) process.env.GITHUB_TOKEN = originalGithubToken;
    else delete process.env.GITHUB_TOKEN;
  });

  it("rejects invalid feedback payloads", async () => {
    const response = await POST(request({ ...validPayload, feedbackType: "worked" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid feedbackType.");
  });

  it("returns a fallback GitHub issue URL when storage is not configured", async () => {
    const response = await POST(request(validPayload));
    const body = await response.json();

    expect(response.status).toBe(501);
    expect(body.error).toBe("Feedback storage is not configured.");
    expect(body.fallbackUrl).toContain("https://github.com/ahmedul/agile-tool-hub/issues/new");
    expect(body.fallbackUrl).toContain("Sprint+Capacity+Calculator");
  });

  it("creates a GitHub issue when the Vercel token is configured", async () => {
    process.env.GITHUB_FEEDBACK_TOKEN = "test-token";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ html_url: "https://github.com/ahmedul/agile-tool-hub/issues/123" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const response = await POST(request(validPayload));
    const body = await response.json();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const issuePayload = JSON.parse(String(init.body));

    expect(response.status).toBe(200);
    expect(body.issueUrl).toBe("https://github.com/ahmedul/agile-tool-hub/issues/123");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/repos/ahmedul/agile-tool-hub/issues",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
    expect(issuePayload.title).toBe("Feature request: Sprint Capacity Calculator");
    expect(issuePayload.body).toContain(validPayload.message);
    expect(issuePayload.body).toContain("https://agiletoolhub.com/tools/sprint-capacity-calculator");
  });
});
