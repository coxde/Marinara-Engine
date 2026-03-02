// ──────────────────────────────────────────────
// Macro Engine — {{user}}, {{char}}, {{date}}, etc.
// ──────────────────────────────────────────────

export interface MacroContext {
  user: string;
  char: string;
  /** All characters in the chat */
  characters: string[];
  /** Custom variables from prompt toggle groups */
  variables: Record<string, string>;
}

/**
 * Replace macros in a prompt string with their values.
 *
 * Supported macros:
 *  - {{user}} / {{persona}} — user's display name
 *  - {{char}} — current character name
 *  - {{characters}} — comma-separated list of all character names
 *  - {{date}} — current real date (YYYY-MM-DD)
 *  - {{time}} — current real time (HH:MM)
 *  - {{random}} — random number 0-100
 *  - {{random:X:Y}} — random number X-Y
 *  - {{getvar::name}} — dynamic variable from preset
 *  - {{trim}} — remove surrounding whitespace (processed last)
 */
export function resolveMacros(template: string, ctx: MacroContext): string {
  let result = template;

  // Static substitutions
  result = result.replace(/\{\{user\}\}/gi, ctx.user);
  result = result.replace(/\{\{persona\}\}/gi, ctx.user);
  result = result.replace(/\{\{char\}\}/gi, ctx.char);
  result = result.replace(/\{\{characters\}\}/gi, ctx.characters.join(", "));

  // Date/time
  const now = new Date();
  result = result.replace(/\{\{date\}\}/gi, now.toISOString().slice(0, 10));
  result = result.replace(
    /\{\{time\}\}/gi,
    now.toTimeString().slice(0, 5),
  );

  // Random numbers
  result = result.replace(/\{\{random\}\}/gi, () =>
    String(Math.floor(Math.random() * 101)),
  );
  result = result.replace(/\{\{random:(\d+):(\d+)\}\}/gi, (_, min, max) => {
    const lo = parseInt(min, 10);
    const hi = parseInt(max, 10);
    return String(Math.floor(Math.random() * (hi - lo + 1)) + lo);
  });

  // Variable substitution
  result = result.replace(/\{\{getvar::(\w+)\}\}/gi, (_, name) => {
    return ctx.variables[name] ?? "";
  });

  // Trim markers
  result = result.replace(/\{\{trim\}\}/gi, "");
  result = result.trim();

  return result;
}
