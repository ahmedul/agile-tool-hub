import { POST as storyPointPost } from "@/app/api/agent/story-point/route";
import { POST as sprintCapacityPost } from "@/app/api/agent/sprint-capacity/route";
import { calculateStoryPointEstimate, calculateSprintCapacity } from "@/lib/agent-tools";

function request(body: unknown) {
  return new Request("https://agiletoolhub.com/api/agent/tool", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("agent tool calculations", () => {
  it("matches the story point calculator scoring rules", () => {
    expect(calculateStoryPointEstimate({
      effort: 2,
      complexity: 1,
      uncertainty: 1,
      risk: 0,
      dependencies: 1,
    })).toMatchObject({ estimate: 3, score: 5, confidence: "Medium" });
  });

  it("calculates maximum and recommended sprint capacity", () => {
    expect(calculateSprintCapacity(10, [
      { name: "Developer 1", daysAvailable: 8, velocity: 2 },
      { name: "Developer 2", daysAvailable: 6, velocity: 1.5 },
    ])).toMatchObject({
      maxCapacity: 25,
      recommendedCapacity: 20,
      totalAvailableDays: 14,
      totalTeamDays: 20,
      availabilityPercent: 70,
    });
  });
});

describe("agent tool API routes", () => {
  it("returns a structured story point response with CORS headers", async () => {
    const response = await storyPointPost(request({
      story: "Add export filters",
      factors: { effort: 2, complexity: 1, uncertainty: 1, risk: 0, dependencies: 1 },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.tool).toBe("story-point-estimator");
    expect(body.estimate).toBe(3);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("rejects invalid story point factors", async () => {
    const response = await storyPointPost(request({
      factors: { effort: 4, complexity: 1, uncertainty: 1, risk: 0, dependencies: 1 },
    }));

    expect(response.status).toBe(400);
  });

  it("returns a structured sprint capacity response", async () => {
    const response = await sprintCapacityPost(request({
      sprintDays: 10,
      members: [
        { name: "Developer 1", daysAvailable: 8, velocity: 2 },
        { name: "Developer 2", daysAvailable: 6, velocity: 1.5 },
      ],
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.tool).toBe("sprint-capacity-calculator");
    expect(body.recommendedCapacity).toBe(20);
    expect(body.members[0].capacity).toBe(16);
  });
});
