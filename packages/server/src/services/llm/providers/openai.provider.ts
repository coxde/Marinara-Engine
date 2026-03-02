// ──────────────────────────────────────────────
// LLM Provider — OpenAI (& OAI-Compatible)
// ──────────────────────────────────────────────
import { BaseLLMProvider, type ChatMessage, type ChatOptions } from "../base-provider.js";

/**
 * Handles OpenAI, OpenRouter, Mistral, Cohere, and any OpenAI-compatible endpoint.
 */
export class OpenAIProvider extends BaseLLMProvider {
  async *chat(
    messages: ChatMessage[],
    options: ChatOptions,
  ): AsyncGenerator<string, void, unknown> {
    const url = `${this.baseUrl}/chat/completions`;

    const body = {
      model: options.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options.temperature ?? 1,
      max_tokens: options.maxTokens ?? 4096,
      top_p: options.topP ?? 1,
      stream: options.stream ?? true,
      ...(options.stop?.length ? { stop: options.stop } : {}),
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorText.slice(0, 500)}`);
    }

    if (!options.stream) {
      const json = (await response.json()) as { choices: Array<{ message: { content: string } }> };
      yield json.choices[0]?.message?.content ?? "";
      return;
    }

    // Stream SSE response
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
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data) as {
            choices: Array<{ delta: { content?: string } }>;
          };
          const content = parsed.choices[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  }
}
