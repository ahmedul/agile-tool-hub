import { POST } from "@/app/api/ai-generate/route";

it("keeps the paid provider unreachable while AI mode has not launched", async () => {
  vi.stubEnv("OPENAI_API_KEY", "configured-key");
  const provider = vi.spyOn(globalThis, "fetch");
  try {
    const response = await POST();
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await response.json()).error).toContain("Local mode");
    expect(provider).not.toHaveBeenCalled();
  } finally {
    provider.mockRestore();
    vi.unstubAllEnvs();
  }
});
