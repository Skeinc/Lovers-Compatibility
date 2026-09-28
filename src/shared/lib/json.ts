export type JsonPrimitive = string | number | boolean | null;

export interface JsonObject {
  readonly [key: string]: JsonValue;
}

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export function parseJson(text: string): JsonValue {
  // JSON.parse — граница парсинга. Дальше значение проверяет Zod.
  const parsed = JSON.parse(text) as JsonValue;
  return parsed;
}

export function readErrorMessage(error: object | string | number | boolean | null): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Неизвестная ошибка";
}
