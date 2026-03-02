// ──────────────────────────────────────────────
// LLM Provider — Google Gemini
// ──────────────────────────────────────────────
import { BaseLLMProvider, type ChatMessage, type ChatOptions } from "../base-provider.js";

/**
 * Handles Google Gemini API (generateContent / streamGenerateContent).
 */
export class GoogleProvider extends BaseLLMProvider {
  async *chat(
    messages: ChatMessage[],
    options: ChatOptions,
  ): AsyncGenerator<string, void, unknown> {
    const model = options.model || "gemini-2.0-flash";
    const endpoint = options.stream ? "streamGenerateContent" : "generateContent";
    const url = `${this.baseUrl}/models/${model}:${endpoint}?key=${this.apiKey}${options.stream ? "&alt=sse" : ""}`;

    // Convert to Gemini format
    const systemMessages = messages.filter((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    const contents = chatMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 1,
        maxOutputTokens: options.maxTokens ?? 4096,
        topP: options.topP ?? 1,
      },
    };

    if (systemMessages.length > 0) {
      body.systemInstruction = {
        parts: [{ text: systemMessages.map((m) => m.content).join("\n\n") }],
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText.slice(0, 500)}`);
    }

    if (!options.stream) {
      const json = (await response.json()) as {
        candidates: Array<{
          content: { parts: Array<{ text: string }> };
        }>;
      };
      yield json.candidates[0]?.content?.parts[0]?.text ?? "";
      return;
    }

    // Stream SSE
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);

        try {
          const parsed = JSON.parse(data) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
            }>;
          };
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text;
        } catch {
          // Skip malformed lines
        }
      }
    }
  }
}
