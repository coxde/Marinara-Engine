// ──────────────────────────────────────────────
// LLM Provider — Anthropic Claude
// ──────────────────────────────────────────────
import { BaseLLMProvider, type ChatMessage, type ChatOptions } from "../base-provider.js";

/**
 * Handles Anthropic Claude API (Messages API).
 */
export class AnthropicProvider extends BaseLLMProvider {
  async *chat(
    messages: ChatMessage[],
    options: ChatOptions,
  ): AsyncGenerator<string, void, unknown> {
    const url = `${this.baseUrl}/v1/messages`;

    // Claude requires system prompt separate from messages
    const systemMessages = messages.filter((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    // Ensure alternating user/assistant pattern (Claude requirement)
    const mergedMessages = this.mergeConsecutiveMessages(chatMessages);

    const body = {
      model: options.model,
      max_tokens: options.maxTokens ?? 4096,
      ...(systemMessages.length > 0 && {
        system: systemMessages.map((m) => m.content).join("\n\n"),
      }),
      messages: mergedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: options.stream ?? true,
      ...(options.temperature !== undefined && { temperature: options.temperature }),
      ...(options.topP !== undefined && { top_p: options.topP }),
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${errorText.slice(0, 500)}`);
    }

    if (!options.stream) {
      const json = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
      };
      yield json.content.find((c) => c.type === "text")?.text ?? "";
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
          const event = JSON.parse(data) as {
            type: string;
            delta?: { type: string; text?: string };
          };
          if (event.type === "content_block_delta" && event.delta?.text) {
            yield event.delta.text;
          }
          if (event.type === "message_stop") return;
        } catch {
          // Skip malformed lines
        }
      }
    }
  }

  /**
   * Merge consecutive same-role messages (Claude requires alternation).
   */
  private mergeConsecutiveMessages(messages: ChatMessage[]): ChatMessage[] {
    const merged: ChatMessage[] = [];
    for (const msg of messages) {
      const last = merged[merged.length - 1];
      if (last && last.role === msg.role) {
        last.content += "\n\n" + msg.content;
      } else {
        merged.push({ ...msg });
      }
    }
    // Ensure starts with user
    if (merged.length > 0 && merged[0]!.role !== "user") {
      merged.unshift({ role: "user", content: "[Start]" });
    }
    return merged;
  }
}
