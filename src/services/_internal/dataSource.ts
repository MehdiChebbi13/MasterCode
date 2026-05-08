export type DataSource = "mock" | "api";

export function dataSource(): DataSource {
  const v = process.env.NEXT_PUBLIC_DATA_SOURCE;
  return v === "api" ? "api" : "mock";
}

export type AIProvider = "mock" | "anthropic" | "openai";

export function aiProvider(): AIProvider {
  if (dataSource() === "mock") return "mock";
  const v = process.env.NEXT_PUBLIC_AI_PROVIDER;
  return v === "openai" ? "openai" : "anthropic";
}
