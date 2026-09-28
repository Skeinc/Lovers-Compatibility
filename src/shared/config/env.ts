export interface AiConfig {
  url: string;
  key: string;
  model: string;
}

function readString(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export function readAiConfig(): AiConfig | null {
  const url = readString(import.meta.env.VITE_AI_API_URL).replace(/\/+$/, "");
  const key = readString(import.meta.env.VITE_AI_API_KEY);
  const model = readString(import.meta.env.VITE_AI_MODEL);
  if (url === "" || key === "" || model === "") return null;
  return { url, key, model };
}
