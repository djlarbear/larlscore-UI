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
  // Strip bullet prefix, then strip emojis from the text — keep the line even if it had emojis
  const cleanedLines = raw
    .split('\n')
    .map(l => l.trim().replace(/^[•\-]\s*/, '').trim())   // strip bullet prefix
    .map(l => l.replace(EMOJI_REGEX, '').trim())           // strip emojis from content
    .filter(Boolean);                                       // drop empty

  const injuryLines: string[] = []; // injury adjustments — always shown first
  const modelLines:  string[] = []; // "Model predicts/favors …"
  const dataLines:   string[] = []; // "Pace-adjusted:", "Team strength:"
  const edgeLines:   string[] = []; // "X.X point edge identified…"
  const generic:     string[] = []; // filler — only used to pad to `max`

  for (const line of cleanedLines) {
    // Always discard bare section headers
    if (/^Edge (Breakdown|Components):\s*$/.test(line)) continue;

    if (/^Injur/i.test(line)) {
      // Injury adjustment lines (after emoji strip: "Injuries: Williams out (-4.3) → -4.3 pt adjustment")
      injuryLines.push(line);
    } else if (/^Model (predicts|favors)/i.test(line)) {
      modelLines.push(line);
    } else if (/^(Pace.adjusted|Team strength)/i.test(line)) {
      dataLines.push(line);
    } else if (/point edge identified/i.test(line)) {
      edgeLines.push(line);
    } else {
      generic.push(line);
    }
  }

  return [...injuryLines, ...modelLines, ...dataLines, ...edgeLines, ...generic].slice(0, max);
}
