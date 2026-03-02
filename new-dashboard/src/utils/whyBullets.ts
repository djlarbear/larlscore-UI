/**
 * buildWhyBullets — shared "Why This Pick" filter/prioritizer
 *
 * Priority order (highest → lowest):
 *   1. Model prediction  ("Model predicts/favors …")
 *   2. Data adjustments  ("Pace-adjusted:", "Team strength:")
 *   3. Edge line         ("X.X point edge identified …")
 *   4. Generic context   ("Strong cover opportunity …", "High-scoring matchup …")
 *
 * Always discarded:
 *   - Bare section headers with no data ("Edge Breakdown:", "Edge Components:")
 *   - Lines containing emojis
 *
 * Returns exactly `max` bullets when the raw string has enough content,
 * fewer only if the raw string truly has nothing useful.
 */

// Regex to match any emoji
const EMOJI_REGEX = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

export function buildWhyBullets(raw: string, max = 3): string[] {
  const lines = raw
    .split('\n')
    .map(l => l.trim().replace(/^[•\-]\s*/, '').trim())
    .filter(Boolean)
    .filter(l => !EMOJI_REGEX.test(l)); // Remove lines containing emojis

  // Clean emojis from each line
  const cleanedLines = lines.map(line => line.replace(EMOJI_REGEX, '').trim()).filter(Boolean);

  const modelLines: string[] = [];  // highest priority
  const dataLines:  string[] = [];  // pace / team strength
  const edgeLines:  string[] = [];  // "X.X point edge identified…"
  const generic:    string[] = [];  // filler — only used to pad to `max`

  for (const line of cleanedLines) {
    // Always discard bare section headers
    if (/^Edge (Breakdown|Components):\s*$/.test(line)) continue;

    if (/^Model (predicts|favors)/i.test(line)) {
      modelLines.push(line);
    } else if (/^(Pace.adjusted|Team strength)/i.test(line)) {
      dataLines.push(line);
    } else if (/point edge identified/i.test(line)) {
      edgeLines.push(line);
    } else {
      // Generic lines (confidence restatements, matchup descriptions).
      // Only shown when higher-priority content doesn't fill the quota.
      generic.push(line);
    }
  }

  return [...modelLines, ...dataLines, ...edgeLines, ...generic].slice(0, max);
}
